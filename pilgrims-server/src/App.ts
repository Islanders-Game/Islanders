import express from 'express';
import http from 'http';
import { ObjectId } from 'mongodb';
import monk from 'monk';
import * as dotenv from 'dotenv';
import { success, fail, World } from '../../pilgrims-shared/dist/Shared';
import { GameSocket } from './GameSocket';
import { GameService } from './services/GameService';
import { ChatService } from './services/ChatService';
import { GameRepository } from './repositories/GameRepository';

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
const playerSockets: { [playerName: string]: string } = {};

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

app.get('/newgame', async (_, res) => {
  const world: World = new World();
  const db = monk(mongoURL);
  const result = await db.get('games').insert(world);
  const id = result._id;
  console.info(`[${id}] Created game.`);

  gameSocket.setupSocketOnNamespace(id, playerSockets);
  res.send(id);
  db.close();
});

app.get('/joingame', async (req, res) => {
  const playerName = req.query.playerName;
  const gameID = req.query.gameId;
  console.info(`[${gameID}] Received /joingame GET with player: ${playerName}`);
  const db = monk(mongoURL);
  let game: World | undefined;
  try {
    game = (await db.get('games').findOne(new ObjectId(gameID))) as World;
  } catch (ex) {
    // to ensure the await is handled properly.
  } finally {
    if (!game) {
      res.send(fail('Game does not exist!'));
    } else if (game.players.some((x) => x.name === playerName)) {
      res.send(fail('A player with that name already exists on this game!'));
    }
    res.send(success('Game exists and player name is not taken'));
    db.close();
  }
});

//Initialize
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

server.listen(process.env.PORT, () =>
  console.info(`[INFO] pilgrims-server listening on port ${process.env.PORT}`),
);
//
