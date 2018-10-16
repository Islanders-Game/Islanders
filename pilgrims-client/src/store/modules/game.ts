import { GetterTree, MutationTree, ActionTree, ActionContext } from 'vuex';

// The state
export class State {
  public gameId: string = undefined;
  public playerName: string = undefined;
}

// Synchrounous getters: GetterTree<local state, root state>
const getters: GetterTree<State, any> = {
  getGameId(state: State): string {
    return state.gameId;
  },
  getPlayerName(state: State): string {
    return state.playerName;
  },
};

// Synchrounous setters MutationTree<local state, root state>
const mutations: MutationTree<State> = {
  setGameId(state: State, gameId: string) {
    state.gameId = gameId;
  },
  setPlayerName(state: State, playerName: string) {
    state.playerName = playerName;
  },
};

// Async methods
const actions: ActionTree<State, State> = {};

export default {
  namespaced: true,
  state: new State(),
  getters,
  actions,
  mutations,
};
