import ChatAPI, { ChatMessage } from '@/api/ChatAPI';
import { GetterTree, MutationTree, ActionTree, ActionContext } from 'vuex';

// The state
export class State {
    public messages: ChatMessage[] = [];
}

// Synchrounous getters: GetterTree<local state, root state>
const getters: GetterTree<State, State> = {
    getMessages(state: State): ChatMessage[] {
        return state.messages;
    },
};

// Synchrounous setters MutationTree<local state, root state>
const mutations: MutationTree<State> = {
    addMessage(state: State, message: ChatMessage) {
        state.messages.push(message);
    },
    setMessages(state: State, messages: ChatMessage[]) {
        state.messages = messages.slice(0);
    },
};

// Async methods
const actions: ActionTree<State, State> = {
    async getMessages({ commit }: ActionContext<State, State>) {
        const messages = await ChatAPI.getMessages();
        commit('setMessages', messages);
        return messages;
    },
    async addMessage({ commit }: ActionContext<State, State>, message: ChatMessage) {
        ChatAPI.addMessage(message);
        commit('addMessage', message);
    },
};

export default {
    namespaced: true,
    state: new State(),
    getters,
    actions,
    mutations,
};
