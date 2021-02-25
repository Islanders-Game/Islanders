import { Server, Namespace, Socket } from 'socket.io';
import http from 'http';
import { SocketActions, ChatMessage, Action, World, Tile } from '../../islanders-shared/dist/Shared';
import { GameService } from './services/GameService';
import { ChatService } from './services/ChatService';
import { GameRepository } from './repositories/GameRepository';
import { LockMapAction, ProposeTradeAction } from '../../islanders-shared/dist/Action';
import { GamePlayerSockets, Disconnected } from './App';

export class GameSocket {
  private io: Server;
  private gameService: GameService;
  private chatService: ChatService;
  private gameRepository: GameRepository;

  constructor(server: http.Server, gameService: GameService, chatService: ChatService, gameRepository: GameRepository) {
    this.io = new Server(server, { cors: { origin: '*' } });
    this.gameService = gameService;
    this.chatService = chatService;
    this.gameRepository = gameRepository;
  }

  public setupSocketOnNamespace(gameID: string, gamePlayerSockets: GamePlayerSockets): void {
    const nsp = this.io.of(`/${gameID}`);
    nsp.on(SocketActions.connect, (connection: Socket) => {
      GameSocket.logSocketEvent(gameID, SocketActions.connect);
      GameSocket.logConnectEvent(gameID, connection.id);

      connection.on(SocketActions.join, (name: string) => {
        GameSocket.logSocketEvent(gameID, SocketActions.join);
        const playerName = name || connection.id;
        GameSocket.logJoinEvent(gameID, playerName);

        this.setUpGetWorld(connection, gameID);
        this.setupInitWorld(connection, gameID, nsp);
        this.setUpLockMap(connection, gameID, nsp);
        this.setUpNewMap(connection, gameID, nsp);
        this.setUpChat(connection, gameID, nsp);
        this.setUpSendAction(connection, gameID, nsp);
        this.setUpProposeTradeAction(connection, gameID, nsp);
        GameSocket.setUpDisconnect(connection, gameID, gamePlayerSockets);

        this.checkForReconnect(gameID, playerName, gamePlayerSockets, connection.id).then((r) =>
          nsp.emit(SocketActions.newWorld, r));
      });

      setInterval(() => GameSocket.clearNamespaceIfEmpty(nsp, gamePlayerSockets), 18000000); // Clear every half hour.
    });
  }

  private setUpGetWorld(connection: Socket, gameID: string) {
    connection.on(SocketActions.getWorld, async () => {
      GameSocket.logSocketEvent(gameID, SocketActions.getWorld);
      connection.emit(SocketActions.newWorld, await this.gameRepository.getWorld(gameID));
    });
  }

  private setupInitWorld(connection: Socket, gameID: string, namespace: Namespace) {
    connection.on(SocketActions.initWorld, (init: World) => {
      GameSocket.logSocketEvent(gameID, SocketActions.initWorld);
      this.gameService.initWorld(init, gameID, namespace);
    });
  }

  private setUpLockMap(connection: Socket, gameID: string, namespace: Namespace) {
    connection.on(SocketActions.lockMap, async (pointsToWin: number) => {
      GameSocket.logSocketEvent(gameID, SocketActions.lockMap);
      const lock: LockMapAction = new LockMapAction(pointsToWin);
      namespace.emit(SocketActions.newWorld, await this.gameService.applyAction(gameID, lock));
    });
  }

  private setUpNewMap(connection: Socket, gameID: string, namespace: Namespace) {
    connection.on(SocketActions.newMap, (map: Tile[]) => {
      GameSocket.logSocketEvent(gameID, SocketActions.newMap);
      this.gameService.updateMap(map, gameID, namespace);
    });
  }

  private setUpChat(connection: Socket, gameID: string, namespace: Namespace) {
    connection.on(SocketActions.chat, (chat: ChatMessage) => {
      GameSocket.logSocketEvent(gameID, SocketActions.chat);
      this.chatService.chatMessage(chat, gameID, namespace);
    });
  }

  private setUpSendAction(connection: Socket, gameID: string, namespace: Namespace) {
    connection.on(SocketActions.sendAction, async (action: Action) => {
      GameSocket.logSocketEvent(gameID, SocketActions.sendAction);
      const result = await this.gameService.applyAction(gameID, action);
      namespace.emit(SocketActions.newWorld, result);
    });
  }

  setUpProposeTradeAction = (connection: Socket, gameID: string, namespace: Namespace) => {
    connection.on(SocketActions.proposeTrade, async (action: ProposeTradeAction) => {
      GameSocket.logSocketEvent(gameID, SocketActions.sendAction);
      namespace.emit(SocketActions.proposeTrade, action);
    });
  }

  private static setUpDisconnect(connection: Socket, gameID: string, gameSockets: GamePlayerSockets) {
    connection.on('disconnect', () => {
      const sockets = gameSockets[gameID];
      const disconnectPlayerName = Object.keys(sockets).find((key) => sockets[key] === connection.id);
      if (disconnectPlayerName) sockets[disconnectPlayerName] = Disconnected;
    });
  }

  private async checkForReconnect(
    gameID: string,
    playerName: string,
    gamePlayerSockets: GamePlayerSockets,
    socketID: string,
  ) {
    const sockets = gamePlayerSockets[gameID];
    if (!sockets[playerName]) {
      sockets[playerName] = socketID;
      return this.gameService.addPlayer(gameID, playerName);
    }
    // Previous socket disconnected, but player exists. Re-add socket, but don't add player.
    sockets[playerName] = socketID;
    return this.gameRepository.getWorld(gameID);
  }

  private static logSocketEvent(gameID: string, type: string) {
    console.info(`[${gameID}] Received a ${type} socket event.`);
  }

  private static logJoinEvent(gameID: string, playerName: string) {
    console.info(`[${gameID}] Join by player named: ${playerName}.`);
  }

  private static logConnectEvent(gameID: string, socketID: string) {
    console.info(`[${gameID}] Player connected with socket ID ${socketID}.`);
  }

  private static clearNamespaceIfEmpty(namespace: Namespace, gamePlayerSockets: GamePlayerSockets) {
    namespace.sockets.forEach((socket) => socket.disconnect());
    namespace.removeAllListeners();
    // eslint-disable-next-line no-param-reassign
    delete gamePlayerSockets[namespace.name.substring(1)];
  }
}
