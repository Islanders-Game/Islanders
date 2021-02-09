import Vue from 'vue';
import Vuex, { GetterTree, MutationTree } from 'vuex';
import chat from './modules/chat';
import game from './modules/game';
import ui from './modules/ui';
import { io, Socket } from 'socket.io-client';
import { ActionTree, ActionContext } from 'vuex';
import Axios from 'axios';
import { Result } from '../../../pilgrims-shared/dist/Shared';
import { onFailure } from '../helpers/FlatMapper';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';
export let ServerSocket: Socket;

export class State { }

const getterTree: GetterTree<State, any> = {};

const mutationTree: MutationTree<State> = {};

const host = `http://${process.env.VUE_APP_SERVER}:${process.env.VUE_APP_SERVERPORT}/`;

const actionTree: ActionTree<any, any> = {
  async createGame({ commit }: ActionContext<any, any>, playerName: string) {
    const { data }: { data: string } = await await Axios.get(host + 'newgame');
    const gameId = data;

    const socket = io(`${host}${gameId}`);
    socket.emit('join', playerName);
    ServerSocket = socket;

    commit('game/setGameId', gameId);
    commit('game/setPlayerName', playerName);
  },
  async joinGame(
    { commit }: ActionContext<any, any>,
    gameStartInfo: { gameId: string; playerName: string },
  ) {
    const query = `?playerName=${gameStartInfo.playerName}&gameId=${gameStartInfo.gameId}`;
    const { data }: { data: Result } = await Axios.get(
      `${host}joingame${query}`,
    );

    onFailure(data, (r) => {
      throw Error(r);
    });

    const socket = io(`${host}${gameStartInfo.gameId}`);
    socket.emit('join', gameStartInfo.playerName);
    ServerSocket = socket;

    commit('game/setGameId', gameStartInfo.gameId);
    commit('game/setPlayerName', gameStartInfo.playerName);
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
