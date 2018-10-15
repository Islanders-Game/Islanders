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
  Init, 
  TurnEnd, 
  Chat,
  Join,
  World,
  Action,
  Player,
  rules,
  ruleReducer,
} from '../../pilgrims-shared/dist/Shared';

const app = express();
const server = http.createServer(app);
const io = socket.listen(server);
const port = 3000;

app.post('/newgame', async (req, res) => {
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
    socket.join(join.gameID);
    addPlayer(join.gameID, join.name).then(r => {
      io.sockets.in(join.gameID).emit('world', r);
    })
  });
  socket.on('turn_end', (turn: TurnEnd) => {
    if (!turn) console.info(`'turn_end' with empty turn.`);
    if (!turn || !turn.turn.player || !turn.turn.actions) return;
    console.info(`'turn_end' on game ${turn.gameID} with turn.`);
    console.info(turn);
    applyTurn(turn.gameID, turn.turn).then((res) => {
      io.sockets.in(turn.gameID).emit('world', res);
    });
  });
  socket.on('chat', (chat: Chat) => {
    if (!chat) console.info(`'chat' with empty message.`);
    if (!chat || !chat.message.user || !chat.message.text) return;
    console.info(
      `'chat' on game ${chat.gameID} by ${chat.message.user} with text ${
        chat.message.text
      }.`,
    );
      io.sockets.in(chat.gameID).emit('chat', chat.message);
  });
  socket.on('init_world', (init: Init) => {
    if (!init) console.info(`'init_world' with empty message.`);
    if (!init || !init.gameID || !init.world) return;
    const db = monk('localhost:27017/pilgrims');
    db.get('games').findOne({ world: init.world }).then(world => {
      if (!world.started) { io.sockets.in(init.gameID).emit('world', init.world); };
    });
    db.close();
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
  const mapped: (Rule | undefined)[] = actions.map((a) => {
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
    return undefined;
  });
  if (mapped.some((r) => r === undefined))
    return { tag: 'Failure', reason: 'Unknown rule' };
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
