/* eslint-disable no-param-reassign */

import { GetterTree, MutationTree, ActionTree, ActionContext } from 'vuex';
import { ProposeTradeAction } from '../../../../islanders-shared/dist/Action';
import {
  Player,
  World,
  SocketActions,
  Result,
  Tile,
  Action,
  DiceRoll,
  GameState,
  success,
  toResultInstance,
} from '../../../../islanders-shared/dist/Shared';
import { SocketConnection, State as RootState } from '../store';

// The state
export class State {
  public gameId: string = undefined;
  public playerName: string = undefined;
  public pointsToWin = 10;
  public world: World = undefined;
  public error: string = undefined;
}

// Synchrounous getters: GetterTree<local state, root state>
// Getters should only be used if caching the result gives performance ie. dont just return state objects.
const getters: GetterTree<State, unknown> = {
  getWorld(state: State): World {
    return state.world;
  },
  getError(state: State): string {
    return state.error;
  },
  getPlayers(state: State): Player[] {
    return state.world?.players;
  },
  getPlayer: (state: State) => (name: string) => state.world?.players.find((x) => x.name === name),
  getIsGameStarted(state: State): boolean {
    if (!state.world) {
      return false;
    }
    return state.world.gameState === 'Started' || state.world.gameState === 'Pregame';
  },
  getCurrentPlayer(state: State): Player {
    if (!state.world) {
      return undefined;
    }
    return state.world.players[state.world.currentPlayer];
  },
  getCurrentDie(state: State): DiceRoll {
    if (!state.world) {
      return undefined;
    }
    return state.world.currentDie;
  },
  getPointsToWin(state: State) {
    return state.world.pointsToWin;
  },
  getPlayerColorAsHex: (state: State) => (name: string) => {
    const color = state.world?.players.find((x) => x.name === name)?.color;
    const asHex = `#${(color >>> 0).toString(16).padStart(6, '0')}`;
    return asHex;
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
  setWorld(state: State, world: World) {
    state.world = world;
  },
  setFailure(state: State, reason: string) {
    state.error = reason;
  },
  setStarted(state: State, gameState: GameState) {
    state.world.gameState = gameState;
  },
  setError(state: State, errorMessage: string) {
    state.error = errorMessage;
  },
  setPointsToWin(state: State, points: number) {
    state.world.pointsToWin = points;
  },
};

// Async methods
const actions: ActionTree<State, RootState> = {
  async bindToWorld({ commit }: ActionContext<State, RootState>) {
    // Connect to socket and setup listener for listening to events.
    SocketConnection.socket.on(SocketActions.newWorld, (result: Result) => {
      const asResultInstance = toResultInstance(result);
      asResultInstance
        .flatMap((world: World) => {
          commit('setWorld', world);
          if (world.conditions?.playedKnight
            && !world.conditions.playedKnight.movedThief) commit('ui/setIsPlayingKnight', true, { root: true });
          if (world.conditions.playedRoadBuilding) {
            const { roadsBuilt } = world.conditions?.playedRoadBuilding;
            const { expected } = world.conditions?.playedRoadBuilding;
            if (expected && roadsBuilt && expected < roadsBuilt) {
              commit('ui/setIsPlayingRoadBuilding', true, { root: true });
              commit('ui/setIsBuilding', 'Road', { root: true });
              // Cancel thief movement if player was moving the thief while playing Road Building
              commit('ui/setIsMovingThief', false, { root: true });
            } else {
              commit('ui/setIsPlayingRoadBuilding', false, { root: true });
              commit('ui/setIsBuilding', 'None', { root: true });
            }
          }
          commit('setError', undefined);
          return success(world);
        })
        .onFailure((r) => {
          commit('setError', r);
        });
    });
    SocketConnection.socket.on(SocketActions.proposeTrade, (action: ProposeTradeAction) => {
      const mapped = { player: action.parameters.playerName,
        wants: action.parameters.wantsResources,
        resources: action.parameters.resources };
      commit('ui/setPlayerProposesTrade', mapped, { root: true });
    });
  },
  async startGame({ commit }: ActionContext<State, RootState>, pointsToWin: number) {
    SocketConnection.socket.emit(SocketActions.lockMap, pointsToWin);
  },
  async updateMap({ commit }: ActionContext<State, RootState>, map: Tile[]) {
    SocketConnection.socket.emit(SocketActions.newMap, map);
  },
  async sendAction({ commit }: ActionContext<State, RootState>, action: Action) {
    SocketConnection.socket.emit(SocketActions.sendAction, action);
  },
  async proposeTrade({ commit }: ActionContext<State, RootState>, action: ProposeTradeAction) {
    SocketConnection.socket.emit(SocketActions.proposeTrade, action);
  },
};

export default {
  namespaced: true,
  state: new State(),
  getters,
  actions,
  mutations,
};
