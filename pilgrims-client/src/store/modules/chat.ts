import ChatAPI, { ChatMessage } from '@/api/ChatAPI';
import {GetterTree, MutationTree, ActionTree, ActionContext} from 'vuex';

// The state
export class State {
    public messages: ChatMessage[] = [{text: 'store text', user: 'store user'}];
}

// Synchrounous getters
const getters = {
    getMessages(state: State): ChatMessage[] {
        return state.messages;
    },
} as GetterTree<State, any>;

// Synchrounous setters
const mutations = {
    addMessage(state: State, message: ChatMessage) {
        state.messages.push(message);
    },
    setMessages(state: State, messages: ChatMessage[]) {
        state.messages = messages;
    },
} as MutationTree<State>;

// Async methods
const actions = {
    async getMessages(store: ActionContext<State, any>) {
        const messages = await ChatAPI.getMessages();
        store.commit('setMessages', messages);
        return messages;
    },
    async addMessage(store: ActionContext<State, any>, message: ChatMessage) {
        await ChatAPI.addMessage(message);
        store.commit('addMessage', message);
    },
} as ActionTree<State, any>;

export default {
    namespaced: true,
    state: new State(),
    getters,
    actions,
    mutations,
};
