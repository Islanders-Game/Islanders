import Vue from 'vue';
import Vuex from 'vuex';
import chat from './modules/chat';
import game from './modules/game';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

const actionSet: ActionTree<any, any> = {
  async createGame({ commit }: ActionContext<any, any>, gameStartInfo: { gameId: string, playerName: string }) {
    const result = await Axios.post('localhost:3000', gameStartInfo);
    // todo use result to check for errors.
    SocketWrapper.connectSocket(`localhost:3000/${gameStartInfo.gameId}`);
    commit('game/setGameId', gameStartInfo.gameId);
    commit('game/setPlayerName', gameStartInfo.playerName);
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
});
