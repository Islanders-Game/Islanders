import socket from 'socket.io';
import http from 'http';
import { SocketActions, ChatMessage } from '../../pilgrims-shared/dist/Shared';
import { GameService } from './services/GameService';
import { World } from '../../pilgrims-shared/dist/World';
import { Turn } from '../../pilgrims-shared/dist/Turn';
import { Tile } from '../../pilgrims-shared/dist/Tile';
import { ChatService } from './services/ChatService';

export class GameSocket {
  private io: SocketIO.Server;
  private gameService: GameService;
  private chatService: ChatService;

  constructor(
    server: http.Server,
    gameService: GameService,
    chatService: ChatService,
  ) {
    this.io = socket.listen(server);
    this.gameService = gameService;
    this.chatService = chatService;
  }

  public setupSocketOnNamespace(gameID: string) {
    const nsp = this.io.of(`/${gameID}`);
    nsp.on('connection', (socket) => {
      console.info(`Player connected to socket with namespace ${gameID}`);
      socket.on(SocketActions.join, (name: string) => {
        const playerName = name ? name : socket.id;
        console.info(
          `'join' on game ${gameID} by player named: ${playerName}.`,
        );
        socket.on(SocketActions.getWorld, async () => {
          console.log(`Received a ${SocketActions.getWorld} socket event`);
          socket.emit(
            SocketActions.newWorld,
            await this.gameService.findWorld(gameID),
          );
        });
        socket.on(SocketActions.initWorld, (init: World) => {
          console.log(`Received a ${SocketActions.initWorld} socket event`);
          this.gameService.initWorld(init, gameID, nsp);
        });
        socket.on(SocketActions.turnEnd, (turn: Turn) => {
          console.log(`Received a ${SocketActions.turnEnd} socket event`);
          this.gameService.turnEnd(turn, gameID, nsp);
        });
        socket.on(SocketActions.startGame, () => {
          console.log(`Received a ${SocketActions.startGame} socket event`);
          this.gameService.startGame(gameID, nsp);
        });
        socket.on(SocketActions.newMap, (map: Tile[]) => {
          console.log(`Received a ${SocketActions.newMap} socket event`);
          this.gameService.updateMap(map, gameID, nsp);
        });
        socket.on(SocketActions.chat, (chat: ChatMessage) => {
          console.log(`Received a ${SocketActions.chat} socket event`);
          this.chatService.chatMessage(chat, gameID, nsp);
        });
        this.gameService
          .addPlayer(gameID, playerName)
          .then((r) => nsp.emit(SocketActions.newWorld, r));
      });

      setInterval(() => this.clearNamespaceIfEmpty(nsp, this.io), 18000000); // Clear every half hour.
    });
  }

  private clearNamespaceIfEmpty(
    namespace: SocketIO.Namespace,
    server: SocketIO.Server,
  ) {
    const connectedSockets = Object.keys(namespace.connected);
    if (connectedSockets.length < 0) return;
    connectedSockets.forEach((socketId) => {
      namespace.connected[socketId].disconnect();
    });
    namespace.removeAllListeners();
    delete server.nsps[namespace.name];
  }
}
