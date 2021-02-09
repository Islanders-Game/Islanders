import { ChatMessage } from '../../../pilgrims-shared/dist/Shared';
import { Namespace } from 'socket.io';

export class ChatService {
  public chatMessage(
    chat: ChatMessage,
    gameID: string,
    namespace: Namespace,
  ) {
    if (!chat) console.info(`[${gameID}] Chat with empty message.`);
    if (!chat || !chat.user || !chat.text) return;
    console.info(`[${gameID}] Chat by ${chat.user}: "${chat.text}".`);
    namespace.emit('chat', chat);
  }
}
