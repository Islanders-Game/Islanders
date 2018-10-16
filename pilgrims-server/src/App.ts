import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import socket from 'socket.io';
import mongo from 'mongodb';
import monk from 'monk';

import {
  Result,
  Rule,
  Turn,
  Join,
  World,
  Action,
  Player,
  rules,
  ruleReducer,
  ChatMessage,
} from '../../pilgrims-shared/dist/Shared';

const app = express();
const server = http.createServer(app);
const io = socket.listen(server);
const port = 3000;

app.post('/newgame', async (_, res) => {
  const world: World = {
    players: [],
    map: [{type: 'Desert', diceRoll: 'None' }],
    started: false
  };
  const db = monk('localhost:27017/pilgrims');
  const result = await db.get('games').insert({ world });
  res.send(result._id);
  db.close();
});

//Socket.io
io.on('connection', (socket) => {
  socket.on('join', (join: Join) => {
    if (!join.name) {
      console.info(`'join' with no player name.`);
      return;
    }
    if (!join.gameID) {
      console.info(`'join' with no game ID.`);
      return;
    }
    console.info(`'join' on game ${join.gameID} by player named: ${join.name}.`);
    const gameID = `/${join.gameID}`;
    const namespace = io.of(gameID);

    socket.on('turn_end', (turn: Turn) => {
      if (!turn) console.info(`'turn_end' with empty turn.`);
      if (!turn || !turn.player || !turn.actions) return;
      console.info(`'turn_end' on game ${gameID} with turn:`);
      console.info(turn);
      applyTurn(gameID, turn).then((res) => {
        namespace.emit('world', res);
      });
    });

    socket.on('chat', (chat: ChatMessage) => {
      if (!chat) console.info(`'chat' with empty message.`);
      if (!chat || !chat.user || !chat.text) return;
      console.info(
        `'chat' on game ${gameID} by ${chat.user} with text ${
          chat.text
        }.`,
      );
      namespace.emit('chat', chat);
    });

    socket.on('init_world', (init: World) => {
      if (!init) console.info(`'init_world' with empty message.`);
      if (!init || !gameID) return;
      console.info(`'init_world' on game ${gameID} with world:`);
      console.info(init);
      const db = monk('localhost:27017/pilgrims');
      db.get('games').findOne({ world: init }).then(world => {
        if (!world.started) { namespace.emit('world', init); };
      });
      db.close();
    });

    addPlayer(gameID, join.name).then(r => namespace.emit('world', r));
  });
});
//

//Game
const applyTurn = async (id: string, turn: Turn) => {
  const toApply = mapRules(turn.actions);
  if (toApply.tag === 'Failure') return toApply;
  const result = await findWorld(id);
  if (result.tag === 'Failure') return result;
  if (result.world.started) return { tag: 'Failure', reason: 'Game is not started!' };
  const apply = toApply.world.reduce(ruleReducer, result);
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

async function addPlayer (gameID: string, name: string) {
  try {
    const result: Result<World> = await findWorld(gameID);
    if (result.tag === 'Failure') return result;
    const player = new Player(name);
    const players = result.world.players.concat(player);
    return { tag: 'Success', world: { ...result.world, players } };
  } catch {
    return { tag: 'Failure', reason: `Could not add player ${name}!` };
  }
};

async function findWorld(id: string): Promise<Result<World>> {
  try {
    const db = monk('localhost:27017/pilgrims');
    const dbResult = await db.get('games').findOne(id);
    const result = dbResult as World;
    db.close();
    if (!(result as World))
      return { tag: 'Failure', reason: 'World could not be found!' };
    return { tag: 'Success', world: result };
  } catch {
    return { tag: 'Failure', reason: 'World could not be found!' };
  }
}
//

//Initialize
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.use(bodyParser.json());
server.listen(port, () =>
  console.log(`pilgrims-server listening on port ${port}!`),
);
//
