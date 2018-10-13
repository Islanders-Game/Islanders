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
  World,
  Action,
  Player,
  ChatMessage,
  rules,
  ruleReducer,
} from '../../pilgrims-shared/dist/Shared';

const app = express();
const server = http.createServer(app);
const io = socket.listen(server);
const port = 3000;

app.post('/newgame', async (req, res) => {
  const db = monk('localhost:27017/pilgrims');
  const world = req.body;
  const result = await db.get('games').insert({ world });
  res.send(result._id);
  db.close();
});

//Socket.io
io.on('connection', (socket: SocketIO.Socket) => {
  console.info(`Player connected on ${socket.id}.`);
  socket.on('game_start', (message: string) => {
    try {
      console.info(`'game_start' with message: "${message}".`);
      if (!message) return;
      const game = JSON.parse(message);
      if (!game || !game.id) return;
      console.info(`'game_start' with game:`);
      console.info(game);
      const namespace = io.of(`/${game.id}`);
      namespace.on('connection', (socket) => {
        socket
          .on('join', (player: Player) => {
            if (!player) console.info(`'join' with no player.`);
            if (!player || !player.id) return;
            console.info(`'join' on game ${game.id} by ${player.id}.`);
            const result = addPlayer(game.id, player);
            namespace.emit('joined', result);
          })
          .on('turn_end', (turn: Turn) => {
            if (!turn) console.info(`'turn_end' with empty turn.`);
            if (!turn || !turn.player || !turn.actions) return;
            console.info(`'turn_end' on game ${game.id} with turn.`);
            console.info(turn);
            applyTurn(game.id, turn).then((res) => namespace.emit('apply_turn', res));
          })
          .on('chat', (chatMessage: ChatMessage) => {
            if (!chatMessage) console.info(`'chat' with empty message.`);
            if (!chatMessage || !chatMessage.user || !chatMessage.text) return;
            console.info(
              `'chat' on game ${game.id} by ${chatMessage.user} with text ${chatMessage.text}.`,
            );
            namespace.emit('chat', chatMessage);
          });
        });
    } catch (e) {
      console.error(e);
    }
  });
});
//

//Game
const applyTurn = async (id: string, turn: Turn) => {
  const toApply = mapRules(turn.actions);
  if (toApply.tag === 'Failure') return toApply;
  const world = await findWorld(id);
  const result = toApply.world.reduce(ruleReducer, world);
  return result;
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

const addPlayer = async (id: string, player: Player) => {
  try {
    const result: Result<World> = await findWorld(id);
    if (result.tag === 'Failure') return result;
    const players = result.world.players.concat(player);
    return { tag: 'Success', world: { ...result, players } };
  } catch {
    return { tag: 'Failure' };
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
