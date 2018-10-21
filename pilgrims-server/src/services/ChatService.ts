import { ChatMessage } from '../../../pilgrims-shared/dist/Shared';

export class ChatService {
  public chatMessage(
    chat: ChatMessage,
    gameID: string,
    namespace: SocketIO.Namespace,
  ) {
    if (!chat) console.info(`'chat' with empty message.`);
    if (!chat || !chat.user || !chat.text) return;
    console.info(
      `'chat' on game ${gameID} by ${chat.user} with text ${chat.text}.`,
    );
    namespace.emit('chat', chat);
  }
}
