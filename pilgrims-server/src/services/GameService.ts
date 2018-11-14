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
import { GameRepository } from '../repositories/GameRepository';

export class GameService {
  private gameRepository: GameRepository;
  constructor(gameRepository: GameRepository) {
    this.gameRepository = gameRepository;
  }

  public async initWorld(
    init: World,
    gameID: string,
    namespace: SocketIO.Namespace,
  ) {
    if (!init) console.info(`[${gameID}] 'init_world' with empty message.`);
    if (!init || !gameID) return;
    console.info(`[${gameID}] 'init_world' with World:`);
    console.info(init);
    const r = await this.gameRepository.getWorld(gameID);
    if (r.tag === 'Success' && r.value.gameState !== 'Started') {
      await this.gameRepository.createGame(init);
      namespace.emit(SocketActions.newWorld, success(init));
    }
  }

  public async updateMap(
    map: Tile[],
    gameID: string,
    namespace: SocketIO.Namespace,
  ) {
    const result = await this.gameRepository.getWorld(gameID);
    if (result.tag === 'Failure') {
      console.info(`[${gameID}] 'Failure' with reason: ${result.reason}`);
      return;
    }

    if (result.value.gameState === 'Started') {
      namespace.emit(
        SocketActions.newWorld,
        fail('You cannot update the map once the game has started!'),
      );
      return;
    }
    result.value.map = map;
    await this.gameRepository.updateGame(gameID, result.value);
    namespace.emit(SocketActions.newWorld, result);
  }

  public async addPlayer(gameID: string, name: string): Promise<Result<World>> {
    try {
      const result: Result<World> = await this.gameRepository.getWorld(gameID);
      if (result.tag === 'Failure') return result;
      if (result.value.gameState === 'Started') return success(result.value); // spectator mode

      const player = new Player(name);
      const players = result.value.players.concat([player]);
      players.sort((x, y) => x.name.localeCompare(y.name));
      const world = {
        ...result.value,
        players: players,
      };

      await this.gameRepository.updateGame(gameID, world);
      return { tag: 'Success', value: world };
    } catch (ex) {
      return {
        tag: 'Failure',
        reason: `Could not add player ${name}! Ex: ${ex}`,
      };
    }
  }

  public async applyAction(id: string, action: Action): Promise<Result<World>> {
    const toApply = this.mapRules([action]);
    if (toApply.tag === 'Failure') return toApply;
    const result = await this.gameRepository.getWorld(id);
    if (result.tag === 'Failure') return result;
    const apply = toApply.value.reduce(ruleReducer, result);
    if (apply.tag === 'Failure') return apply;

    this.gameRepository.updateGame(id, apply.value);
    return apply;
  }

  private mapRules(actions: Action[]): Result<Rule[]> {
    if (!actions) return { tag: 'Failure', reason: 'No rules given!' };
    const mapped: (Rule | string)[] = actions.map((a) => {
      switch (a.type) {
        case 'buildCity':
          return rules.BuildCity(a);
        case 'buildHouse':
          return rules.BuildHouse(a);
        case 'buildHouseInitial':
          return rules.BuildHouseInitial(a);
        case 'buildRoad':
          return rules.BuildRoad(a);
        case 'buildRoadInitial':
          return rules.BuildRoadInitial(a);
        case 'buyCard':
          return rules.BuyCard(a);
        case 'playCard':
          return rules.PlayCard(a);
        case 'placeThief':
          return rules.MoveThief(a);
        case 'trade':
          return rules.Trade(a);
        case 'startGame':
          return rules.StartGame(a);
        case 'lockMap':
          return rules.LockMap(a);
        case 'endTurn':
          return rules.EndTurn(a);
        default:
          return `Could not map Action: { ${Object.keys(a).join(', ')} }!`;
      }
    });
    if (mapped.some((r) => typeof r === 'string')) {
      const reasons = mapped.filter((r) => typeof r === 'string').join(', ');
      return { tag: 'Failure', reason: reasons };
    }
    return { tag: 'Success', value: mapped as Rule[] };
  }
}
