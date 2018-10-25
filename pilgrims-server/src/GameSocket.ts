import socket from 'socket.io';
import http from 'http';
import {
  SocketActions,
  ChatMessage,
  Action,
} from '../../pilgrims-shared/dist/Shared';
import { GameService } from './services/GameService';
import { World } from '../../pilgrims-shared/dist/World';
import { Turn } from '../../pilgrims-shared/dist/Turn';
import { Tile } from '../../pilgrims-shared/dist/Tile';
import { ChatService } from './services/ChatService';
import { GameRepository } from './repositories/GameRepository';
import { StartGameAction } from '../../pilgrims-shared/dist/Action';

export class GameSocket {
  private io: SocketIO.Server;
  private gameService: GameService;
  private chatService: ChatService;
  private gameRepository: GameRepository;

  constructor(
    server: http.Server,
    gameService: GameService,
    chatService: ChatService,
    gameRepository: GameRepository,
  ) {
    this.io = socket.listen(server);
    this.gameService = gameService;
    this.chatService = chatService;
    this.gameRepository = gameRepository;
  }

  public setupSocketOnNamespace(gameID: string) {
    const nsp = this.io.of(`/${gameID}`);
    nsp.on('connection', (socket) => {
      this.logConnectEvent(gameID, socket.id);
      socket.on(SocketActions.join, (name: string) => {
        const playerName = name ? name : socket.id;
        this.logJoinEvent(gameID, playerName);
        socket.on(SocketActions.getWorld, async () => {
          this.logSocketEvent(gameID, SocketActions.getWorld);
          socket.emit(
            SocketActions.newWorld,
            await this.gameRepository.getWorld(gameID),
          );
        });
        socket.on(SocketActions.initWorld, (init: World) => {
          this.logSocketEvent(gameID, SocketActions.initWorld);
          this.gameService.initWorld(init, gameID, nsp);
        });
        socket.on(SocketActions.startGame, async () => {
          this.logSocketEvent(gameID, SocketActions.startGame);
          const start: StartGameAction = { type: 'startGame' };
          nsp.emit(
            SocketActions.newWorld,
            await this.gameService.applyAction(gameID, start),
          );
        });
        socket.on(SocketActions.newMap, (map: Tile[]) => {
          this.logSocketEvent(gameID, SocketActions.newMap);
          this.gameService.updateMap(map, gameID, nsp);
        });
        socket.on(SocketActions.chat, (chat: ChatMessage) => {
          this.logSocketEvent(gameID, SocketActions.chat);
          this.chatService.chatMessage(chat, gameID, nsp);
        });
        socket.on(SocketActions.sendAction, async (action: Action) => {
          this.logSocketEvent(gameID, SocketActions.sendAction);
          const result = await this.gameService.applyAction(gameID, action);
          nsp.emit(SocketActions.newWorld, result);
        });
        this.gameService
          .addPlayer(gameID, playerName)
          .then((r) => nsp.emit(SocketActions.newWorld, r));
      });

      setInterval(() => this.clearNamespaceIfEmpty(nsp, this.io), 18000000); // Clear every half hour.
    });
  }

  private logSocketEvent(gameID: string, type: string) {
    console.info(`[${gameID}] Received a ${type} socket event.`);
  }
  private logJoinEvent(gameID: string, playerName: string) {
    console.info(`[${gameID}] Join by player named: ${playerName}.`);
  }
  private logConnectEvent(gameID: string, socketID: string) {
    console.info(`[${gameID}] Player connected with socket ID ${socketID}.`);
  }

  private clearNamespaceIfEmpty(
    namespace: SocketIO.Namespace,
    server: SocketIO.Server,
  ) {
    const connectedSockets = Object.keys(namespace.connected);
    if (connectedSockets.length <= 0) return;
    connectedSockets.forEach((socketId) => {
      namespace.connected[socketId].disconnect();
    });
    namespace.removeAllListeners();
    delete server.nsps[namespace.name];
  }
}
