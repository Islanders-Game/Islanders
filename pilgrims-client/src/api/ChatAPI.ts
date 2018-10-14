import { ChatMessage } from '../../../pilgrims-shared/dist/Shared';

// in memory datastore for now.
const MESSAGES: ChatMessage[] = [];

export default {
  async getMessages(): Promise<ChatMessage[]> {
    // tslint:disable-next-line:no-console
    console.log('ChatAPI::getMessages, started');
    await setTimeout(() => 0, 100);
    return MESSAGES;
  },

  async addMessage(message: ChatMessage) {
    // tslint:disable-next-line:no-console
    console.log('ChatAPI::addMessage, started');
    await setTimeout(() => 0, 100);
    MESSAGES.push(message);
  },
};
