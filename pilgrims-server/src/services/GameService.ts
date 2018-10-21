import {
  World,
  Turn,
  Tile,
  SocketActions,
  success,
  fail,
  Result,
  Player,
  ruleReducer,
  Action,
  Rule,
  rules,
} from '../../../pilgrims-shared/dist/Shared';
import monk from 'monk';
import { ObjectId } from 'bson';

export class GameService {
  private mongoURL: string;
  constructor(dbConnectionString: string) {
    this.mongoURL = dbConnectionString;
  }

  public async initWorld(
    init: World,
    gameID: string,
    namespace: SocketIO.Namespace,
  ) {
    if (!init) console.info(`'init_world' with empty message.`);
    if (!init || !gameID) return;
    console.info(`'init_world' on game ${gameID} with world:`);
    console.info(init);
    const r = await this.findWorld(gameID);
    if (r.tag === 'Success' && !r.world.started) {
      const db = monk(this.mongoURL);
      await db.get('games').insert(init);
      db.close();
      namespace.emit(SocketActions.newWorld, init);
    }
  }

  public async startGame(gameID: string, namespace: SocketIO.Namespace) {
    const db = monk(this.mongoURL);
    const dbResult = await db.get('games').findOne(new ObjectId(gameID));
    const result = dbResult as World;
    result.started = true;
    await db.get('games').update(new ObjectId(gameID), result);
    namespace.emit(SocketActions.newWorld, success(result));
  }

  public turnEnd(turn: Turn, gameID: string, namespace: SocketIO.Namespace) {
    if (!turn) console.info(`'turn_end' with empty turn.`);
    if (!turn || !turn.player || !turn.actions) return;
    console.info(`'turn_end' on game ${gameID} with turn:`);
    console.info(turn);
    this.applyTurn(gameID, turn).then((res) => {
      namespace.emit(SocketActions.newWorld, res);
    });
  }

  public async updateMap(
    map: Tile[],
    gameID: string,
    namespace: SocketIO.Namespace,
  ) {
    const db = monk(this.mongoURL);
    const dbResult = await db.get('games').findOne(new ObjectId(gameID));
    const result = dbResult as World;
    if (result.started) {
      namespace.emit(
        SocketActions.newWorld,
        fail('You cannot update the map once the game has started'),
      );
      return;
    }
    result.map = map;
    await db.get('games').update(new ObjectId(gameID), result);
    namespace.emit(SocketActions.newWorld, success(result));
  }

  public async addPlayer(gameID: string, name: string) {
    try {
      const result: Result<World> = await this.findWorld(gameID);
      if (result.tag === 'Failure') return result;
      const player = new Player(name);
      const players = result.world.players.concat([player]);
      const world = { ...result.world, players };
      const db = monk(this.mongoURL);
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

  public async applyTurn(id: string, turn: Turn) {
    const toApply = this.mapRules(turn.actions);
    if (toApply.tag === 'Failure') return toApply;
    const result = await this.findWorld(id);
    if (result.tag === 'Failure') return result;
    if (result.world.started)
      return { tag: 'Failure', reason: 'Game is not started!' };
    const apply = toApply.world.reduce(ruleReducer, result);
    const db = monk(this.mongoURL);
    await db.get('games').insert(apply);
    return apply;
  }

  public async findWorld(id: string): Promise<Result<World>> {
    const db = monk(this.mongoURL);
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

  private mapRules(actions: Action[]): Result<Rule[]> {
    if (!actions) return { tag: 'Failure', reason: 'No rules given!' };
    const mapped: (Rule | string)[] = actions.map((a) => {
      switch (a.type) {
        case 'buildCity':
          return rules.BuildCity(a);
        case 'buildHouse':
          return rules.BuildHouse(a);
        case 'buildRoad':
          return rules.BuildRoad(a);
        case 'buyCard':
          return rules.BuyCard(a);
        case 'playCard':
          return rules.PlayCard(a);
        case 'placeThief':
          return rules.MoveThief(a);
        case 'trade':
          return rules.Trade(a);
        default:
          return `Could not map Action: { ${Object.keys(a).join(', ')} }!`;
      }
    });
    if (mapped.some((r) => typeof r === 'string')) {
      const reasons = mapped.filter((r) => typeof r === 'string').join(', ');
      return { tag: 'Failure', reason: reasons };
    }
    return { tag: 'Success', world: mapped as Rule[] };
  }
}
