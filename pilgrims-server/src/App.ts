import express from 'express';
import http from 'http';
import socket from 'socket.io';
import { ObjectId } from 'mongodb';
import monk from 'monk';
import * as dotenv from 'dotenv';

import {
  Result,
  success,
  fail,
  Rule,
  Turn,
  World,
  Action,
  Player,
  rules,
  ruleReducer,
  ChatMessage,
  SocketActions,
} from '../../pilgrims-shared/dist/Shared';

const app = express();
const server = http.createServer(app);
const io = socket.listen(server);
dotenv.config();
const mongoURL = `${process.env.MONGO_URL}:${process.env.MONGO_PORT}/pilgrims`

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

app.get('/newgame', async (_, res) => {
  const world: World = {
    players: [],
    map: [{ type: 'Desert', diceRoll: 'None', coord: { x: 0, y: 0 } }],
    started: false,
  };
  const db = monk(mongoURL);
  const result = await db.get('games').insert(world);
  const id = result._id;
  console.info('Created game with id: ' + id);

  setupSocketOnNamespace(id);
  res.send(id);
  db.close();
});

app.get('/joingame', async (req, res) => {
  const playerName = req.query.playerName;
  const gameID = req.query.gameId;
  console.info(`Player ${playerName} trying to join game ${gameID}`);
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

const setupSocketOnNamespace = (gameID: string) => {
  const nsp = io.of(`/${gameID}`);
  nsp.on('connection', (socket) => {
    console.info(`Player connected to socket with namespace ${gameID}`);
    socket.on(SocketActions.join, (name: string) => {
      const playerName = name ? name : socket.id;
      console.info(`'join' on game ${gameID} by player named: ${playerName}.`);
      socket.on(SocketActions.getWorld, async () => {
        console.log(`Received a ${SocketActions.getWorld} socket event`);
        socket.emit(SocketActions.newWorld, await findWorld(gameID));
      });
      socket.on(SocketActions.initWorld, (init: World) => {
        console.log(`Received a ${SocketActions.initWorld} socket event`);
        initWorld(init, gameID, nsp);
      });
      socket.on(SocketActions.turnEnd, (turn: Turn) => {
        console.log(`Received a ${SocketActions.turnEnd} socket event`);
        turnEnd(turn, gameID, nsp);
      });
      socket.on(SocketActions.chat, (chat: ChatMessage) => {
        console.log(`Received a ${SocketActions.chat} socket event`);
        chatMessage(chat, gameID, nsp);
      });
      addPlayer(gameID, playerName).then((r) =>
        nsp.emit(SocketActions.newWorld, r),
      );
    });

    setInterval(() => clearNamespaceIfEmpty(nsp, io), 18000000); // Clear every half hour.
  });
};

//Game
const initWorld = async (
  init: World,
  gameID: string,
  namespace: SocketIO.Namespace,
) => {
  if (!init) console.info(`'init_world' with empty message.`);
  if (!init || !gameID) return;
  console.info(`'init_world' on game ${gameID} with world:`);
  console.info(init);
  const r = await findWorld(gameID);
  if (r.tag === 'Success' && !r.world.started) {
    const db = monk(mongoURL);
    await db.get('games').insert(init);
    db.close();
    namespace.emit(SocketActions.newWorld, init);
  }
};

const chatMessage = (
  chat: ChatMessage,
  gameID: string,
  namespace: SocketIO.Namespace,
) => {
  if (!chat) console.info(`'chat' with empty message.`);
  if (!chat || !chat.user || !chat.text) return;
  console.info(
    `'chat' on game ${gameID} by ${chat.user} with text ${chat.text}.`,
  );
  namespace.emit('chat', chat);
};

const turnEnd = (turn: Turn, gameID: string, namespace: SocketIO.Namespace) => {
  if (!turn) console.info(`'turn_end' with empty turn.`);
  if (!turn || !turn.player || !turn.actions) return;
  console.info(`'turn_end' on game ${gameID} with turn:`);
  console.info(turn);
  applyTurn(gameID, turn).then((res) => {
    namespace.emit(SocketActions.newWorld, res);
  });
};

async function addPlayer(gameID: string, name: string) {
  try {
    const result: Result<World> = await findWorld(gameID);
    if (result.tag === 'Failure') return result;
    const player = new Player(name);
    const players = result.world.players.concat([player]);
    const world = { ...result.world, players };
    const db = monk(mongoURL);
    await db.get('games').update(new ObjectId(gameID), world);
    db.close();
    return { tag: 'Success', world };
  } catch (ex) {
    return {
      tag: 'Failure',
      reason: `Could not add player ${name}! Ex: ${ex}`,
    };
  }
}

const applyTurn = async (id: string, turn: Turn) => {
  const toApply = mapRules(turn.actions);
  if (toApply.tag === 'Failure') return toApply;
  const result = await findWorld(id);
  if (result.tag === 'Failure') return result;
  if (result.world.started)
    return { tag: 'Failure', reason: 'Game is not started!' };
  const apply = toApply.world.reduce(ruleReducer, result);
  const db = monk(mongoURL);
  await db.get('games').insert(apply);
  return apply;
};

const mapRules = (actions: Action[]): Result<Rule[]> => {
  if (!actions) return { tag: 'Failure', reason: 'No rules given!' };
  const mapped: (Rule | string)[] = actions.map((a) => {
    if (a.buildCity)
      return rules.BuildCity(a.buildCity.playerID, a.buildCity.coordinates);
    if (a.buildHouse)
      return rules.BuildHouse(a.buildHouse.playerID, a.buildHouse.coordinates);
    if (a.buildRoad)
      return rules.BuildRoad(
        a.buildRoad.playerID,
        a.buildRoad.start,
        a.buildRoad.end,
      );
    if (a.buyCard) return rules.BuyCard(a.buyCard.playerID);
    if (a.moveThief)
      return rules.MoveThief(a.moveThief.playerID, a.moveThief.coordinates);
    if (a.playCard) return rules.PlayCard(a.playCard.playerID, a.playCard.card);
    if (a.trade)
      return rules.Trade(
        a.trade.playerID,
        a.trade.otherPlayerID,
        a.trade.resources,
      );
    return `Could not map Action: { ${Object.keys(a).join(', ')} }!`;
  });
  if (mapped.some((r) => typeof r === 'string')) {
    const reasons = mapped.filter((r) => typeof r === 'string').join(', ');
    return { tag: 'Failure', reason: reasons };
  }
  return { tag: 'Success', world: mapped as Rule[] };
};

async function findWorld(id: string): Promise<Result<World>> {
  const db = monk(mongoURL);
  try {
    const dbResult = await db.get('games').findOne(new ObjectId(id));
    const result = dbResult as World;
    if (!(result as World))
      return { tag: 'Failure', reason: 'World could not be found!' };
    return { tag: 'Success', world: result };
  } catch {
    return { tag: 'Failure', reason: 'World could not be found!' };
  } finally {
    db.close();
  }
}

const clearNamespaceIfEmpty = (
  namespace: SocketIO.Namespace,
  server: SocketIO.Server,
) => {
  const connectedSockets = Object.keys(namespace.connected);
  if (connectedSockets.length < 0) return;
  connectedSockets.forEach((socketId) => {
    namespace.connected[socketId].disconnect();
  });
  namespace.removeAllListeners();
  delete server.nsps[namespace.name];
};
//

//Initialize
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

server.listen(process.env.PORT, () =>
  console.log(`pilgrims-server listening on port ${process.env.PORT}!`),
);
//
