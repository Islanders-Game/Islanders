import { Namespace } from 'socket.io';
import {
  World,
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
} from '../../../colonists-shared/dist/Shared';
import { GameRepository } from '../repositories/GameRepository';

export class GameService {
  private gameRepository: GameRepository;

  constructor(gameRepository: GameRepository) {
    this.gameRepository = gameRepository;
  }

  public async initWorld(init: World, gameID: string, namespace: Namespace): Promise<Result> {
    if (!init) return fail('init_world was called with an empty message.');
    if (!init || !gameID) return fail('Game ID was not specified.');
    console.info(`[${gameID}] 'init_world' with World:`);
    console.info(init);
    const r = await this.gameRepository.getWorld(gameID);
    return r.flatMapAsync(async (w: World) => {
      if (w.gameState === 'Started') {
        await this.gameRepository.createGame(init);
        namespace.emit(SocketActions.newWorld, success(init));
        return success(w);
      }
      return fail('The game has not been started!');
    });
  }

  public async updateMap(map: Tile[], gameID: string, namespace: Namespace): Promise<Result> {
    const result = await this.gameRepository.getWorld(gameID);
    result.onFailure((r) => {
      console.info(`[${gameID}] 'Failure' with reason: ${r}`);
    });
    return result.flatMapAsync(async (w: World) => {
      if (w.gameState === 'Started') {
        const failure = fail('You cannot update the map once the game has started!');
        namespace.emit(SocketActions.newWorld, failure);
        return failure;
      }

      const world = { ...w, map };
      await this.gameRepository.updateGame(gameID, world);
      namespace.emit(SocketActions.newWorld, success(world));
      return success(world);
    });
  }

  public async addPlayer(gameID: string, name: string): Promise<Result> {
    try {
      const result = await this.gameRepository.getWorld(gameID);
      return result.flatMapAsync(async (w: World) => {
        if (w.gameState === 'Started') return success(w); // Spectator mode
        if (w.players.filter((p) => p.name === name).length > 0) {
          return fail(`Another player has already taken the name ${name}`);
        }
        const player = new Player(name);
        const players = w.players.concat([player]);
        players.sort((x, y) => x.name.localeCompare(y.name));
        const world = { ...w, players };
        return this.gameRepository.updateGame(gameID, world);
      });
    } catch (ex) {
      return fail(`Could not add player ${name}! Ex: ${ex}`);
    }
  }

  public async applyAction(id: string, action: Action): Promise<Result> {
    console.info(`Applying action ${action.type}`);
    if (action.type === 'undo') {
      return this.gameRepository.undoMove(id);
    }
    const toApply = GameService.mapRules([action]);
    const result = await this.gameRepository.getWorld(id);
    const apply = toApply.reduce(ruleReducer, result);
    return apply.flatMapAsync(async (w: World) => this.gameRepository.updateGame(id, w));
  }

  private static mapRules(actions: Action[]): Rule[] {
    const mapped: Rule[] = actions.map((a) => {
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
          throw Error(`Could not map Action: { ${Object.keys(a).join(', ')} }!`);
      }
    });
    return mapped;
  }
}
