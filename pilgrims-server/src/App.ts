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

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

app.get('/newgame', async (_, res) => {
  console.log(`Recieved a http /newgame call`);
  const world: World = {
    players: [],
    map: [{ type: 'Desert', diceRoll: 'None', coord: { x: 0, y: 0 } }],
    started: false,
    gameRules: {
      gameType: 'original',
      maxCities: 15,
      maxHouses: 15,
      maxRoads: 15,
      pointsToWin: 10,
      rounds: -1,
    },
  };
  const db = monk(mongoURL);
  const result = await db.get('games').insert(world);
  const id = result._id;
  console.info('Created game with id: ' + id);

  gameSocket.setupSocketOnNamespace(id);
  res.send(id);
  db.close();
});

app.get('/joingame', async (req, res) => {
  const playerName = req.query.playerName;
  const gameID = req.query.gameId;
  console.info(
    `Received a http /joingame call with: player ${playerName}, game ${gameID}`,
  );
  const db = monk(mongoURL);
  let game: World | undefined;
  try {
    game = (await db.get('games').findOne(new ObjectId(gameID))) as World;
  } catch (ex) {
    // to ensure the await is handled properly.
  } finally {
    if (!game) {
      res.send(fail('Game did not exist'));
    } else if (game.players.some((x) => x.name === playerName)) {
      res.send(fail('A player with that name already exists on this game'));
    }
    res.send(success('Game exists and playername not taken'));
    db.close();
  }
});

//Initialize
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

server.listen(process.env.PORT, () =>
  console.log(`pilgrims-server listening on port ${process.env.PORT}!`),
);
//
