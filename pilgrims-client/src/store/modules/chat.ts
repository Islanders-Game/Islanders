import { ChatMessage } from '../../../../pilgrims-shared/dist/Shared';
import { GetterTree, MutationTree, ActionTree, ActionContext } from 'vuex';
import { SocketConnection, State as RootState } from '../store';
// The state
export class State {
  public messages: ChatMessage[] = [];
}

// Synchrounous getters: GetterTree<local state, root state>
// Getters should only be used if caching the result gives performance ie. dont just return state objects.
const getterTree: GetterTree<State, RootState> = {};

// Synchrounous setters MutationTree<local state, root state>
const mutationTree: MutationTree<State> = {
  addMessage(state: State, message: ChatMessage) {
    state.messages.unshift(message);
  },
  setMessages(state: State, messages: ChatMessage[]) {
    state.messages = messages.slice(0);
  },
};

// Async methods
const actionTree: ActionTree<State, RootState> = {
  async bindToMessages({ commit, rootState }: ActionContext<State, RootState>) {
    // Connect to socket and setup listener for listening to events.
    SocketConnection.on('chat', (message: ChatMessage) => {
      commit('addMessage', message);
    });
  },
  async addMessage(
    { rootState }: ActionContext<State, RootState>,
    message: ChatMessage,
  ) {
    // emit chat message to socket.
    SocketConnection.emit('chat', message);
  },
};

export default {
  namespaced: true,
  state: new State(),
  getters: getterTree,
  actions: actionTree,
  mutations: mutationTree,
};
