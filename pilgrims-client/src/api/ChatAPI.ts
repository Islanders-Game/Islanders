export interface ChatMessage {
   text: string;
   user: string;

}
const MESSAGES: ChatMessage[] = [
    { text: 'hej med dig', user: 'Player1' },
    { text: 'hej med dig selv', user: 'Player2' },
    { text: 'hej med dig selv selv', user: 'Player1' },
];

export default {
    async getMessages(): Promise<ChatMessage[]> {
        return new Promise<ChatMessage[]>(() => setTimeout(() => {
            return MESSAGES;
        }, 100));
    },

    async addMessage(message: ChatMessage) {
        // tslint:disable-next-line:no-console
        console.log('ChatAPI::addMessage, started');
        await setTimeout(() => {
            MESSAGES.push(message);
        }, 100);
    },
};
