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
    if (
      'value' in r &&
      r.tag === 'Success' &&
      r.value.gameState !== 'Started'
    ) {
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
    if ('reason' in result) {
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

  public async addPlayer(gameID: string, name: string): Promise<Result> {
    try {
      const result: Result = await this.gameRepository.getWorld(gameID);
      if ('reason' in result) return result;
      if (result.value.gameState === 'Started') return success(result.value); // spectator mode

      const player = new Player(name);
      const players = result.value.players.concat([player]);
      players.sort((x, y) => x.name.localeCompare(y.name));
      const world = {
        ...result.value,
        players: players,
      };

      await this.gameRepository.updateGame(gameID, world);
      return success(world);
    } catch (ex) {
      return fail(`Could not add player ${name}! Ex: ${ex}`);
    }
  }

  public async applyAction(id: string, action: Action): Promise<Result> {
    console.log(`Applying action ${action.type}`);
    const toApply = this.mapRules([action]);
    const result = await this.gameRepository.getWorld(id);
    if ('reason' in result) return result;
    const apply = toApply.reduce(ruleReducer, result);
    if (apply.tag === 'Failure') return apply;
    if ('value' in apply) this.gameRepository.updateGame(id, apply.value);
    return apply;
  }

  private mapRules(actions: Action[]): Rule[] {
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
        case 'moveThief':
          return rules.MoveThief(a);
        case 'moveThiefDevelopmentCard':
          return rules.MoveThiefDevelopmentCard(a);
        case 'playerTrade':
          return rules.PlayerTrade(a);
        case 'bankTrade':
          return rules.BankTrade(a);
        case 'harborTrade':
          return rules.HarborTrade(a);
        case 'lockMap':
          return rules.LockMap(a);
        case 'endTurn':
          return rules.EndTurn(a);
        default:
          return `Could not map Action: { ${Object.keys(a).join(', ')} }!`;
      }
    });
    return mapped.filter((r) => typeof r === 'string') as Rule[];
  }
}
