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
}

// Synchrounous getters: GetterTree<local state, root state>
const getters: GetterTree<State, any> = {
  getGameId(state: State): string {
    return state.gameId;
  },
  getPlayerName(state: State): string {
    return state.playerName;
  },
  getWorld(state: State): World {
    return state.world;
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
  setStarted(state: State, started: boolean) {
    state.world.started = started;
  },
};

// Async methods
const actions: ActionTree<State, State> = {
  async bindToWorld({ commit }: ActionContext<State, RootState>) {
    // Connect to socket and setup listener for listening to events.
    Socket.on(SocketActions.newWorld, (world: Result<World>) => {
      if (world.tag === 'Success') {
        commit('setWorld', world.world);
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
