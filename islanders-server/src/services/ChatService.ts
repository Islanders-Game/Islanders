import { Namespace } from 'socket.io';
import { ChatMessage } from '../../../islanders-shared/lib/Shared';

export class ChatService {
  public chatMessage(chat: ChatMessage, gameID: string, namespace: Namespace): void {
    if (!chat) console.info(`[${gameID}] Chat with empty message.`);
    if (!chat || !chat.user || !chat.text) return;
    console.info(`[${gameID}] Chat by ${chat.user}: "${chat.text}".`);
    namespace.emit('chat', chat);
  }
}
