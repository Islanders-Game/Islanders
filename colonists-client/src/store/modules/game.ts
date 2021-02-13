import {
  GetterTree,
  MutationTree,
  ActionTree,
  ActionContext,
  Getter,
} from 'vuex';
import {
  Player,
  World,
  SocketActions,
  Result,
  Tile,
  Action,
  DiceRollType,
  GameState,
  success,
  toResultInstance,
} from '../../../../colonists-shared/dist/Shared';
import { SocketConnection, State as RootState } from '../store';

// The state
export class State {
  public gameId: string = undefined;
  public playerName: string = undefined;
  public world: World = undefined;
  public error: string = undefined;
}

// Synchrounous getters: GetterTree<local state, root state>
// Getters should only be used if caching the result gives performance ie. dont just return state objects.
const getters: GetterTree<State, any> = {
  getWorld(state: State): World {
    return state.world;
  },
  getError(state: State): string {
    return state.error;
  },
  getPlayers(state: State): Player[] {
    return state.world?.players;
  },
  getPlayer: (state: State) => (name: string) => {
    return state.world?.players.find((x) => x.name === name);
  },
  getIsGameStarted(state: State): boolean {
    if (!state.world) {
      return false;
    }
    return (
      state.world.gameState === 'Started' || state.world.gameState === 'Pregame'
    );
  },
  getCurrentPlayer(state: State): Player {
    if (!state.world) {
      return undefined;
    }
    return state.world.players[state.world.currentPlayer];
  },
  getCurrentDie(state: State): DiceRollType {
    if (!state.world) {
      return undefined;
    }
    return state.world.currentDie;
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
    SocketConnection.on(SocketActions.newWorld, (result: Result) => {
      const asResultInstance = toResultInstance(result);
      asResultInstance
        .flatMap((world: World) => {
          commit('setWorld', world);
          return success(world);
        })
        .onFailure((r) => {
          commit('setError', r);
        });
    });
    // TODO: Is this line needed? Looks very... cyclic.
    // SocketConnection.emit(SocketActions.getWorld);
  },
  async startGame({ commit }: ActionContext<State, RootState>) {
    SocketConnection.emit(SocketActions.lockMap);
  },
  async updateMap({ commit }: ActionContext<State, RootState>, map: Tile[]) {
    SocketConnection.emit(SocketActions.newMap, map);
  },
  async sendAction(
    { commit }: ActionContext<State, RootState>,
    action: Action,
  ) {
    SocketConnection.emit(SocketActions.sendAction, action);
  },
};

export default {
  namespaced: true,
  state: new State(),
  getters,
  actions,
  mutations,
};
