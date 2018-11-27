import { GetterTree, MutationTree, ActionTree, ActionContext } from 'vuex';
import { State as RootState } from '../store';
// The state
export type buildingType = 'None' | 'House' | 'City' | 'Road';
export class State {
  public isBuilding: buildingType = 'None';
  public isPlayingDevelopmentCard: boolean = false;
  public isPlayingKnightCard: boolean = false;
  public choosingResources: number = 0;
}

// Synchrounous getters: GetterTree<local state, root state>
// Getters should only be used if caching the result gives performance ie. dont just return state objects.
const getterTree: GetterTree<State, RootState> = {
  getIsPlayingDevelopmentCard(state: State) {
    return state.isPlayingDevelopmentCard;
  },
  getIsPlayingKnightCard(state: State) {
    return state.isPlayingDevelopmentCard;
  },
  getChoosingResources(state: State) {
    return state.choosingResources;
  },
};

// Synchrounous setters MutationTree<local state, root state>
const mutationTree: MutationTree<State> = {
  setIsBuilding(state: State, flag: buildingType) {
    state.isBuilding = flag;
  },
  setIsPlayingDevelopmentCard(state: State, flag: boolean) {
    state.isPlayingDevelopmentCard = flag;
  },
  setIsPlayingKnightCard(state: State, flag: boolean) {
    state.isPlayingKnightCard = flag;
  },
  setChoosingResources(state: State, toChoose: 1 | 2) {
    return (state.choosingResources = toChoose);
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
