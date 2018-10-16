import Vue from 'vue';
import Vuex from 'vuex';
import chat from './modules/chat';
import game from './modules/game';
import io from 'socket.io-client';
import { ActionTree, ActionContext } from 'vuex';
import Axios from 'axios';
Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

const actionSet: ActionTree<any, any> = {
  async createGame({ commit }: ActionContext<any, any>, playerName: string) {
    const result = await Axios.get('http://localhost:3000/newgame');
    // todo use result to check for errors.
    const { data } = await result;
    const gameId = data;
    SocketWrapper.connectSocket(`localhost:3000/${gameId}`);
    SocketWrapper.getSocket().emit('join', playerName);
    commit('game/setGameId', gameId);
    commit('game/setPlayerName', playerName);
  },
  joinGame({ commit }: ActionContext<any, any>, gameStartInfo: { gameId: string, playerName: string }) {
    SocketWrapper.connectSocket(`localhost:3000/${gameStartInfo.gameId}`);
    SocketWrapper.getSocket().emit('join', gameStartInfo.playerName);
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
  actions: actionSet,
});

export interface ISocketWrapper {
  socket: SocketIOClient.Socket;
  connected: boolean;
  getSocket: () => SocketIOClient.Socket;
  connectSocket: (url: string) => void;
}

// todo move to state
export const SocketWrapper: ISocketWrapper = {
  socket: undefined,
  connected : false,
  getSocket: (): SocketIOClient.Socket => {
    if (!SocketWrapper.connected) {
      throw new Error('Tried to access socket before it was initialized');
    } else {
      return SocketWrapper.socket;
    }
  },
  connectSocket: (url: string) => {
    SocketWrapper.socket = io.connect(url);
    SocketWrapper.connected = true;
  },
};
