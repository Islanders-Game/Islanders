import { GetterTree, MutationTree, ActionTree, ActionContext } from 'vuex';
import {
  World,
  SocketActions,
  Result,
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
};

// Async methods
const actions: ActionTree<State, State> = {
  async bindToWorld({ commit }: ActionContext<State, RootState>) {
    // Connect to socket and setup listener for listening to events.
    Socket.on('world', (world: Result<World>) => {
      if (world.tag === 'Success') {
        commit('setWorld', world.world);
      }
    });
    Socket.emit(SocketActions.getWorld);
  },
};

export default {
  namespaced: true,
  state: new State(),
  getters,
  actions,
  mutations,
};
