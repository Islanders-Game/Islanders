import * as express  from 'express';
import * as socket from 'socket.io';
import * as rethink from 'rethinkdb';
import * as bodyParser from 'body-parser';
import * as http from 'http';

const app = express();
const server = new http.Server(app);
const io = socket(server);
const port = 3000;
let connection: rethink.Connection | undefined;

// RethinkDB
rethink.connect( {host: 'localhost', port: 28015}, (err, c) => {
    if (err) { throw err; }
    connection = c;
});

rethink.db('pilgrims').tableCreate('games').run(connection, (err, result) => {
    if (err) { throw err; }
    console.log(JSON.stringify(result, null, 2));
});

app.post('/newGame', (req, res) => {
    const world = req.body;
    rethink.table('games').insert(world).run(connection, (err, result) => {
        if (err) { throw err; }
        res.send(result. generated_keys[0]);
    });
});
//

//Socket.io
io.on('connection', (socket) => {
    console.info(`Player connected on ${socket.id}.`)
    socket.on('game_start', (message) => {
        const game = JSON.parse(message);
        if (!game || !game.id) return;
        console.info(`'game_start' with game ${game}.`);
        io.of(`/${game.id}`)
          .on('join', (message) => {
                const player /*: Player*/ = JSON.parse(message);
                if (!player || !player.id) return;
                console.info(`'join' on game ${game.id} by ${player.id}.`);
                const result = addPlayer(game.id, player);
                socket.to(game.id).emit('joined', result);
            })
          .on('turn_end', (message) => {
                const turn /*: Turn*/= JSON.parse(message);
                if (!turn || !turn.player || !turn.actions) return;
                console.info(`'turn_end' on game ${game.id} with ${turn}.`);
                const applied /*: Result<World>*/ = applyTurn(game.id, turn);
                socket.to(game.id).emit('apply_turn', applied);
          })
          .on('chat', (message) => {
                const chatMessage /*: ChatMessage*/ = JSON.parse(message);
                if (!chatMessage || !chatMessage.user || !chatMessage.text) return;
                console.info(`'chat' on game ${game.id} by ${chatMessage.user} with text ${chatMessage.text}.`);
                socket.to(game.id).emit('chat', message);
          });
        });

    socket.on('disconnect', (socket) => console.info(`Socket ${socket.id} disconnected.`));
  });
//


//Game
const applyTurn = (id: string, turn /*: Turn*/)/*: Result<World>*/ => {
    const toApply = mapRules(turn.actions) 
    const result = findWorld(id);
    //TODO: Apply all rules to world using Shared application code. Return Result.
    return "";
}

const mapRules = (actions /*: Action[]*/) => {
    //TODO: Lookup actions in Shared.Rules. 
    //TODO: Return mapped rules as array | undefined or Result(?).
    return [];
}

const addPlayer = async (id: string, player /*: Player*/)/*: Result<World>*/ => {
    const result = await findWorld(id);
    if (result.tag === 'Failure') return result;
    const players = result.world //TODO: .players.concat(newPlayer);
    return { tag: 'Success', world: { ...result.world, players }};
}

const findWorld = async (uuid: string)/*: Result<World>*/ => {
    const world = await rethink.table('games').get(uuid).run(connection);
    if (world) return { tag: 'Success', world };
    return { tag: 'Failure', error: 'World not found!' };
}
//

//Initialize
app.use(bodyParser.json());
server.listen(port, () => console.log(`pilgrims-server listening on port ${port}!`))
//