// should be moved to shared.
export interface ChatMessage {
   text: string;
   user: string;
}

// in memory datastore for now.
const MESSAGES: ChatMessage[] = [
    { text: 'hej med dig', user: 'Player1' },
    { text: 'hej med dig selv', user: 'Player2' },
    { text: 'hej med dig selv selv', user: 'Player1' },
];

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
