import express from 'express';
import http from 'http';
import socket from 'socket.io';
import { ObjectId } from 'mongodb';
import monk from 'monk';

import {
  Result,
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
const port = 3000;
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/newgame', async (_, res) => {
  const world: World = {
    players: [],
    map: [{type: 'Desert', diceRoll: 'None' }],
    started: false
  };
  const db = monk('localhost:27017/pilgrims');
  const result = await db.get('games').insert(world);
  const id = result._id;
  console.log('Created game with id: ' + id);

  setupSocketOnNamespace(id);
  res.send(id);
  db.close();
});

const setupSocketOnNamespace = (gameID: string) => {
  const nsp = io.of(`/${gameID}`);
  nsp.on('connection', (socket) => {
    console.log(`Player connected to socket with namespace ${gameID}`);
    socket.on(SocketActions.join, (name: string) => {
      const playerName = name ? name : socket.id;
      console.info(`'join' on game ${gameID} by player named: ${playerName}.`);
      socket.on(SocketActions.getWorld, () => socket.emit('world', findWorld(gameID)));
      socket.on(SocketActions.initWorld, (init: World) => initWorld(init, gameID, nsp));
      socket.on(SocketActions.turnEnd, (turn: Turn) => turnEnd(turn, gameID, nsp));
      socket.on(SocketActions.chat, (chat: ChatMessage) => chatMessage(chat, gameID, nsp));
      addPlayer(gameID, playerName).then(r => nsp.emit('world', r));
    });

    setInterval(() => clearNamespaceIfEmpty(nsp, io), 18000000); // Clear every half hour. 
  })
}

//Game
const initWorld = async (init: World, gameID: string, namespace: SocketIO.Namespace) => {
  if (!init) console.info(`'init_world' with empty message.`);
  if (!init || !gameID) return;
  console.info(`'init_world' on game ${gameID} with world:`);
  console.info(init);
  const r = await findWorld(gameID);  
  if (r.tag === 'Success' && !r.world.started) {
    const db = monk('localhost:27017/pilgrims');
    await db.get('games').insert(init);
    db.close();
    namespace.emit('world', init);
  }
}

const chatMessage = (chat: ChatMessage, gameID: string, namespace: SocketIO.Namespace) => {
  if (!chat) console.info(`'chat' with empty message.`);
  if (!chat || !chat.user || !chat.text) return;
  console.info(
    `'chat' on game ${gameID} by ${chat.user} with text ${
      chat.text
    }.`,
  );
  namespace.emit('chat', chat);
}

const turnEnd = (turn: Turn, gameID: string, namespace: SocketIO.Namespace) => {
  if (!turn) console.info(`'turn_end' with empty turn.`);
  if (!turn || !turn.player || !turn.actions) return;
  console.info(`'turn_end' on game ${gameID} with turn:`);
  console.info(turn);
  applyTurn(gameID, turn).then((res) => {
    namespace.emit('world', res);
  });
}

async function addPlayer (gameID: string, name: string) {
  try {
    const result: Result<World> = await findWorld(gameID);
    if (result.tag === 'Failure') return result;
    const player = new Player(name);
    const players = result.world.players.concat([player]);
    const world = { ...result.world, players };
    const db = monk('localhost:27017/pilgrims');
    await db.get('games').insert(world);
    db.close();
    return { tag: 'Success', world};
  } catch(ex) {
    return { tag: 'Failure', reason: `Could not add player ${name}!` };
  }
};

const applyTurn = async (id: string, turn: Turn) => {
  const toApply = mapRules(turn.actions);
  if (toApply.tag === 'Failure') return toApply;
  const result = await findWorld(id);
  if (result.tag === 'Failure') return result;
  if (result.world.started) return { tag: 'Failure', reason: 'Game is not started!' };
  const apply = toApply.world.reduce(ruleReducer, result);
  const db = monk('localhost:27017/pilgrims');
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
    const reasons = mapped.filter(r => typeof r === 'string').join(', ');
    return { tag: 'Failure', reason: reasons };
  }
  return { tag: 'Success', world: mapped as Rule[] };
};

async function findWorld(id: string): Promise<Result<World>> {
  const db = monk('localhost:27017/pilgrims');
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

const clearNamespaceIfEmpty = (namespace: SocketIO.Namespace, server: SocketIO.Server) => {
  const connectedSockets = Object.keys(namespace.connected);
    if (connectedSockets.length < 0) return;
    connectedSockets.forEach(socketId => {
        namespace.connected[socketId].disconnect();
    });
    namespace.removeAllListeners();
    delete server.nsps[namespace.name];
}
//

//Initialize
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

server.listen(port, () =>
  console.log(`pilgrims-server listening on port ${port}!`),
);
//
