/* eslint-disable no-param-reassign */

import Vue from 'vue';
import Vuex, { GetterTree, MutationTree, ActionTree, ActionContext } from 'vuex';
import { io, Socket } from 'socket.io-client';
import Axios from 'axios';
import chat from './modules/chat';
import game from './modules/game';
import ui from './modules/ui';

import { Result, SocketActions, success, toResultInstance, World } from '../../../colonists-shared/dist/Shared';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export const SocketConnection: { socket?: Socket } = { socket: undefined };

export class State {}

const getterTree: GetterTree<State, unknown> = {};

const mutationTree: MutationTree<State> = {};

const host = `http://${process.env.VUE_APP_SERVER}:${process.env.VUE_APP_SERVERPORT}/`;

const actionTree: ActionTree<unknown, unknown> = {
  async createGame ({ commit }: ActionContext<unknown, unknown>, playerName: string) {
    const { data }: { data: string } = await Axios.get(`${host}newgame`);
    const gameId = data;

    const socket = io(`${host}${gameId}`);
    socket.emit('join', playerName);
    SocketConnection.socket = socket;

    commit('game/setGameId', gameId);
    commit('game/setPlayerName', playerName);
  },

  async joinGame (
    { commit }: ActionContext<unknown, unknown>,
    gameStartInfo: { gameId: string; playerName: string },
  ): Promise<void> {
    const query = `?playerName=${gameStartInfo.playerName}&gameId=${gameStartInfo.gameId}`;
    const { data }: { data: Result } = await Axios.get(`${host}joingame${query}`);

    console.log(data);
    const flatmappable = toResultInstance(data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    flatmappable.flatMap((w: World) => {
      const connection = `${host}${gameStartInfo.gameId}`;
      const socket = io(connection);

      socket.emit(SocketActions.join, gameStartInfo.playerName);
      SocketConnection.socket = socket;

      commit('game/setGameId', gameStartInfo.gameId);
      commit('game/setPlayerName', gameStartInfo.playerName);
      return success(w);
    });

    flatmappable.onFailure((s: string) => commit('game/setError', s));
  },
};

export default new Vuex.Store({
  strict: debug,
  modules: {
    chat,
    game,
    ui,
  },
  state: new State(),
  getters: getterTree,
  mutations: mutationTree,
  actions: actionTree,
});
