import { GetterTree, MutationTree, ActionTree, ActionContext } from 'vuex';
import { State as RootState } from '../store';
// The state
export class State {
  public isBuildingHouse: boolean = false;
}

// Synchrounous getters: GetterTree<local state, root state>
// Getters should only be used if caching the result gives performance ie. dont just return state objects.
const getterTree: GetterTree<State, RootState> = {};

// Synchrounous setters MutationTree<local state, root state>
const mutationTree: MutationTree<State> = {
  setIsBuildingHouse(state: State, flag: boolean) {
    state.isBuildingHouse = flag;
  },
};

// Async methods
const actionTree: ActionTree<State, RootState> = {};

export default {
  namespaced: true,
  state: new State(),
  getters: getterTree,
  actions: actionTree,
  mutations: mutationTree,
};
