/* eslint-disable no-param-reassign */

import { GetterTree, MutationTree, ActionTree } from 'vuex';
import { Resources } from '../../../../colonists-shared/dist/Shared';
import { State as RootState } from '../store';

// The state
export type buildingType = 'None' | 'House' | 'City' | 'Road';
export type TradeParameters = { player: string, resources: Resources };
export class State {
  public isBuilding: buildingType = 'None';
  public isMovingThief = false;
  public isPlayingRoadBuilding = false;
  public isPlayingKnight = false;
  public isStealingFromPlayers = false;
  public playerProposesTrade: TradeParameters | undefined = undefined;
}

// Synchrounous getters: GetterTree<local state, root state>
// Getters should only be used if caching the result gives performance ie. dont just return state objects.
const getterTree: GetterTree<State, RootState> = {};

// Synchrounous setters MutationTree<local state, root state>
const mutationTree: MutationTree<State> = {
  setIsBuilding(state: State, flag: buildingType) {
    state.isBuilding = flag;
  },
  setIsMovingThief(state: State, flag: boolean) {
    state.isMovingThief = flag;
  },
  setIsPlayingKnight(state: State, flag: boolean) {
    state.isPlayingKnight = flag;
  },
  setIsPlayingRoadBuilding(state: State, flag: boolean) {
    state.isPlayingRoadBuilding = flag;
  },
  setIsStealingFromPlayers(state: State, flag: boolean) {
    state.isStealingFromPlayers = flag;
  },
  setPlayerProposesTrade(state: State, flag: TradeParameters) {
    state.playerProposesTrade = flag;
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
