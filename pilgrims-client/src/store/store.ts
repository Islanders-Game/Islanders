import Vue from 'vue';
import Vuex from 'vuex';
import chat from './modules/chat';
import game from './modules/game';
import io from 'socket.io-client';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  strict: debug,
  modules: {
    chat,
    game,
  },
});

export interface ISocketWrapper {
  socket: SocketIOClient.Socket;
  connected: boolean;
  getSocket: () => SocketIOClient.Socket;
  connectSocket: (url: URL) => void;
}

export const SocketWrapper: ISocketWrapper = {
  socket: undefined,
  connected : false,
  getSocket: (): SocketIOClient.Socket => {
    if (!this.connected) {
      throw new Error('Tried to access socket before it was initialized');
    } else {
      return this.socket;
    }
  },
  connectSocket: (url: URL) => {
    this.socket = io.connect(url);
    this.connected = true;
  },
};
