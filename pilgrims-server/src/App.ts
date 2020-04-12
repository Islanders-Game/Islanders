import express from 'express';
import http from 'http';
import mongodb from 'mongodb';
import monk from 'monk';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import { fail, World } from '../../pilgrims-shared/dist/Shared';
import { GameSocket } from './GameSocket';
import { GameService } from './services/GameService';
import { ChatService } from './services/ChatService';
import { GameRepository } from './repositories/GameRepository';
import path from 'path';

const app = express();
const server = http.createServer(app);
dotenv.config();
const mongoURL = `${process.env.MONGO_URL}:${process.env.MONGO_PORT}/pilgrims`;

const gameRepository = new GameRepository(mongoURL);
const gameService = new GameService(gameRepository);
const chatService = new ChatService();
const gameSocket = new GameSocket(
  server,
  gameService,
  chatService,
  gameRepository,
);

export type GamePlayerSockets = { [gameID: string]: PlayerSockets };
export type PlayerSockets = { [playerName: string]: string };
export const Disconnected: 'Disconnect' = 'Disconnect';
const gamePlayerSockets: GamePlayerSockets = {};

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

app.get('/newgame', async (_: Request, res: Response) => {
  const world: World = new World();
  const db = monk(mongoURL);
  const result = await db.get('games').insert(world);
  const id = result._id;
  console.info(`[${id}] Created game.`);

  gamePlayerSockets[id.toString()] = {};
  gameSocket.setupSocketOnNamespace(id.toString(), gamePlayerSockets);
  res.send(id);
  db.close();
});

app.get('/joingame', async (req: Request, res: Response) => {
  const playerName: string = String(req.query.playerName);
  const gameID: string = String(req.query.gameId);
  console.info(`[${gameID}] Received /joingame GET with player: ${playerName}`);
  const db = monk(mongoURL);
  let game: World | undefined;
  try {
    game = (await db
      .get('games')
      .findOne<World>(new mongodb.ObjectId(gameID))) as World;
  } catch (ex) {
    // to ensure the await is handled properly.
  } finally {
    if (!game) {
      res.send('Game does not exist!');
    } else if (
      gamePlayerSockets[gameID][playerName] &&
      gamePlayerSockets[gameID][playerName] !== Disconnected
    ) {
      res.send(fail('A player with that name already exists on this game!'));
    }
    res.send('Game exists and player name is not taken');
    db.close();
  }
});

// Initialize
app.get('/', async (_: Request, res: Response) => {
  res.sendFile('public/index.html', { root: __dirname });
});

server.listen(process.env.PORT, () =>
  console.info(`[INFO] pilgrims-server listening on port ${process.env.PORT}`),
);
//
