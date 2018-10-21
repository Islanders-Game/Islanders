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
} from '../../../../pilgrims-shared/dist/Shared';
import { Socket, State as RootState } from '../store';

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
    if (!state.world) {
      return undefined;
    }
    return state.world.players;
  },
  getPlayer: (state: State) => (name: string) => {
    if (!state.world) {
      return undefined;
    }
    return state.world.players.find((x) => x.name === name);
  },
  getIsGameStarted(state: State): boolean {
    if (!state.world) {
      return false;
    }
    return state.world.started;
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
  setStarted(state: State, started: boolean) {
    state.world.started = started;
  },
};

// Async methods
const actions: ActionTree<State, RootState> = {
  async bindToWorld({ commit }: ActionContext<State, RootState>) {
    // Connect to socket and setup listener for listening to events.
    Socket.on(SocketActions.newWorld, (result: Result<World>) => {
      if (result.tag === 'Success') {
        commit('setWorld', result.world);
      }
      if (result.tag === 'Failure') {
        commit('setError', result.reason);
      }
    });
    Socket.emit(SocketActions.getWorld);
  },
  async startGame({ commit }: ActionContext<State, RootState>) {
    Socket.emit(SocketActions.startGame);
  },
  async updateMap({ commit }: ActionContext<State, RootState>, map: Tile[]) {
    Socket.emit(SocketActions.newMap, map);
  },
};

export default {
  namespaced: true,
  state: new State(),
  getters,
  actions,
  mutations,
};
