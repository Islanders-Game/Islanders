import { Namespace } from 'socket.io';
import { ChatMessage } from '../../../colonists-shared/dist/Shared';

export class ChatService {
  // eslint-disable-next-line class-methods-use-this
  public chatMessage(chat: ChatMessage, gameID: string, namespace: Namespace): void {
    if (!chat) console.info(`[${gameID}] Chat with empty message.`);
    if (!chat || !chat.user || !chat.text) return;
    console.info(`[${gameID}] Chat by ${chat.user}: "${chat.text}".`);
    namespace.emit('chat', chat);
  }
}
