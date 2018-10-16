import Vue from 'vue';
import Vuex, { GetterTree, MutationTree } from 'vuex';
import chat from './modules/chat';
import game from './modules/game';
import io from 'socket.io-client';
import { ActionTree, ActionContext } from 'vuex';
import Axios from 'axios';
Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';
export let Socket: SocketIOClient.Socket;

export class State {
  // public socket: SocketIOClient.Socket = undefined;
}

const getterTree: GetterTree<State, any> = {
  // getSocket(state: State): SocketIOClient.Socket {
  //   return state.socket;
  // },
};

const mutationTree: MutationTree<State> = {
  // setSocket(state: State, socket: SocketIOClient.Socket) {
  //   state.socket = socket;
  // },
};

const actionTree: ActionTree<any, any> = {
  async createGame({ commit }: ActionContext<any, any>, playerName: string) {
    // todo use result to check for errors.
    const { data } = await (await Axios.get('http://localhost:3000/newgame'));
    const gameId = data;
    console.log(gameId);

    const socket = io.connect(`localhost:3000/${gameId}`);
    socket.on('created', () => {
      socket.emit('join', playerName);
    });
    Socket = socket;

    commit('game/setGameId', gameId);
    commit('game/setPlayerName', playerName);
  },
  joinGame({ commit }: ActionContext<any, any>, gameStartInfo: { gameId: string, playerName: string }) {
    const socket = io.connect(`localhost:3000/${gameStartInfo.gameId}`);
    socket.on('created', () => {
      socket.emit('join', gameStartInfo.playerName);
    });
    Socket = socket;

    commit('game/setGameId', gameStartInfo.gameId);
    commit('game/setPlayerName', gameStartInfo.playerName);
  },
};

export default new Vuex.Store({
  strict: debug,
  modules: {
    chat,
    game,
  },
  state: new State(),
  getters: getterTree,
  mutations: mutationTree,
  actions: actionTree,
});

