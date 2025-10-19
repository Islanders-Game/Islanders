import { Server, Namespace, Socket } from 'socket.io';
import http from 'http';
import {
  SocketActions,
  ChatMessage,
  Action,
  LockMapAction,
  ProposeTradeAction,
  World,
  Tile,
} from '../../islanders-shared/lib/Shared';
import { GameService } from './services/GameService';
import { ChatService } from './services/ChatService';
import { GameRepository } from './repositories/GameRepository';
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

        this.checkForReconnect(gameID, playerName, gamePlayerSockets, connection.id)
          .then((r) => {
            nsp.emit(SocketActions.newWorld, r);
            r.onFailure?.((reason: string) => console.warn(`[${gameID}] reconnect emission failure: ${reason}`));
          })
          .catch((err) => {
            console.error(`[${gameID}] reconnect handling threw`, err);
          });
      });

      setInterval(() => GameSocket.clearNamespaceIfEmpty(nsp, gamePlayerSockets), 18000000); // Clear every half hour.
    });
  }

  private setUpGetWorld(connection: Socket, gameID: string) {
    connection.on(SocketActions.getWorld, async () => {
      GameSocket.logSocketEvent(gameID, SocketActions.getWorld);
      const t0 = Date.now();
      try {
        const result = await this.gameRepository.getWorld(gameID);
        connection.emit(SocketActions.newWorld, result);
        result.onFailure?.((reason: string) => console.warn(`[${gameID}] getWorld failure: ${reason}`));
        console.info(`[${gameID}] getWorld served in ${Date.now() - t0}ms`);
      } catch (err) {
        console.error(`[${gameID}] getWorld exception`, err);
      }
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
      const t0 = Date.now();
      try {
        const lock: LockMapAction = new LockMapAction(pointsToWin);
        const result = await this.gameService.applyAction(gameID, lock);
        namespace.emit(SocketActions.newWorld, result);
        result.onFailure?.((reason: string) => console.warn(`[${gameID}] lockMap failure: ${reason}`));
        console.info(`[${gameID}] lockMap processed in ${Date.now() - t0}ms points=${pointsToWin}`);
      } catch (err) {
        console.error(`[${gameID}] lockMap exception`, err);
      }
    });
  }

  private setUpNewMap(connection: Socket, gameID: string, namespace: Namespace) {
    connection.on(SocketActions.newMap, (map: Tile[]) => {
      GameSocket.logSocketEvent(gameID, SocketActions.newMap);
      const size = map?.length ?? 0;
      this.gameService
        .updateMap(map, gameID, namespace)
        .then((r) => r.onFailure?.((reason: string) => console.warn(`[${gameID}] newMap failure: ${reason}`)))
        .catch((err) => console.error(`[${gameID}] newMap exception`, err))
        .finally(() => console.info(`[${gameID}] newMap size=${size}`));
    });
  }

  private setUpChat(connection: Socket, gameID: string, namespace: Namespace) {
    connection.on(SocketActions.chat, (chat: ChatMessage) => {
      GameSocket.logSocketEvent(gameID, SocketActions.chat);
      try {
        this.chatService.chatMessage(chat, gameID, namespace);
      } catch (err) {
        console.error(`[${gameID}] chat exception`, err);
      }
    });
  }

  private setUpSendAction(connection: Socket, gameID: string, namespace: Namespace) {
    connection.on(SocketActions.sendAction, async (action: Action) => {
      GameSocket.logSocketEvent(gameID, SocketActions.sendAction);
      const start = Date.now();
      try {
        const result = await this.gameService.applyAction(gameID, action);
        namespace.emit(SocketActions.newWorld, result);
        result.onFailure?.((reason: string) => console.warn(`[${gameID}] sendAction failure: ${reason}`));
        console.info(`[${gameID}] sendAction ${action.type} duration=${Date.now() - start}ms`);
      } catch (err) {
        console.error(`[${gameID}] sendAction exception`, err);
      }
    });
  }

  setUpProposeTradeAction = (connection: Socket, gameID: string, namespace: Namespace) => {
    connection.on(SocketActions.proposeTrade, async (action: ProposeTradeAction) => {
      GameSocket.logSocketEvent(gameID, SocketActions.proposeTrade);
      try {
        namespace.emit(SocketActions.proposeTrade, action);
      } catch (err) {
        console.error(`[${gameID}] proposeTrade exception`, err);
      }
    });
  };

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
    delete gamePlayerSockets[namespace.name.substring(1)];
  }
}
