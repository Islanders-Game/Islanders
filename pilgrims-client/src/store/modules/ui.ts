import { GetterTree, MutationTree, ActionTree, ActionContext } from 'vuex';
import { State as RootState } from '../store';
// The state
export class State {}

// Synchrounous getters: GetterTree<local state, root state>
const getterTree: GetterTree<State, RootState> = {};

// Synchrounous setters MutationTree<local state, root state>
const mutationTree: MutationTree<State> = {};

// Async methods
const actionTree: ActionTree<State, RootState> = {};

export default {
  namespaced: true,
  state: new State(),
  getters: getterTree,
  actions: actionTree,
  mutations: mutationTree,
};
