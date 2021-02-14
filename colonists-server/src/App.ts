import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';

import { fail, success, World } from '../../colonists-shared/dist/Shared';
import { GameSocket } from './GameSocket';
import { GameService } from './services/GameService';
import { ChatService } from './services/ChatService';
import { GameRepository } from './repositories/GameRepository';

console.info('[INFO] initializing colonists-server');
const app = express();
app.use(cors());

const server = http.createServer(app);

dotenv.config();
const mongoURL = `${process.env.MONGO_URL}:${process.env.MONGO_PORT}/colonists`;

const gameRepository = new GameRepository(mongoURL);
const gameService = new GameService(gameRepository);
const chatService = new ChatService();
const gameSocket = new GameSocket(server, gameService, chatService, gameRepository);

export type GamePlayerSockets = { [gameID: string]: PlayerSockets };
export type PlayerSockets = { [playerName: string]: string };
export const Disconnected = 'Disconnect';
const gamePlayerSockets: GamePlayerSockets = {};

app.use(cors());

app.get('/', async (_, response) => {
  response.send('Server is running.');
});

app.get('/newgame', async (_: Request, res: Response) => {
  try {
    const world = new World();
    const id = await gameRepository.createGame(world);
    console.info(`[${id}] Created game.`);
    gamePlayerSockets[id.toString()] = {};
    gameSocket.setupSocketOnNamespace(id.toString(), gamePlayerSockets);
    res.send(id);
  } catch (ex) {
    res.send(fail('Couldn\'t create game!'));
  }
});

//TODO: This throws if the player attempts to join a nonexistent game!
app.get('/joingame', async (req: Request, res: Response) => {
  const playerName = String(req.query.playerName);
  const gameID = String(req.query.gameId);
  console.info(`[${gameID}] Received /joingame GET with player: ${playerName}`);
  const result = await gameRepository.getWorld(gameID);

  result.flatMap((w: World) => {
    res.status(200).send(success(w));
    console.info(`[${gameID}] Finished /joingame GET with player: ${playerName}`);
    return success(w);
  });
  result.onFailure(() => {
    if (gamePlayerSockets[gameID] && gamePlayerSockets[gameID][playerName] && gamePlayerSockets[gameID][playerName] !== Disconnected) {
      res.send(fail('A player with that name already exists on this game!'));
    }
    res.send(fail('Game does not exist!'));
  });
});

server.listen(process.env.PORT, () => console.info(`[INFO] colonists-server listening on port ${process.env.PORT}`));
