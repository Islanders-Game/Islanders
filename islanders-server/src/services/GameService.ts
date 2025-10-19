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
} from '../../../islanders-shared/lib/Shared';
import { Success } from '../../../islanders-shared/lib/Rules/Result';
import { GameRepository } from '../repositories/GameRepository';

export class GameService {
  private gameRepository: GameRepository;

  constructor(gameRepository: GameRepository) {
    this.gameRepository = gameRepository;
  }

  public async initWorld(init: World, gameID: string, namespace: Namespace): Promise<Result> {
    const startedAt = Date.now();
    if (!init) {
      const msg = 'init_world was called with an empty message.';
      console.warn(`[${gameID}] initWorld: ${msg}`);
      return fail(msg);
    }
    if (!gameID) {
      const msg = 'Game ID was not specified.';
      console.warn(`[${gameID}] initWorld: ${msg}`);
      return fail(msg);
    }
    console.info(
      `[${gameID}] initWorld: received world seed (players=${init.players.length}, state=${init.gameState})`,
    );
    const r = await this.gameRepository.getWorld(gameID);
    const result = await r.flatMapAsync(async (w: World) => {
      if (w.gameState === 'Started') {
        await this.gameRepository.createGame(init);
        namespace.emit(SocketActions.newWorld, success(init));
        console.info(`[${gameID}] initWorld: created new world; emit broadcast. Duration=${Date.now() - startedAt}ms`);
        return success(w);
      }
      const msg = 'The game has not been started!';
      console.warn(`[${gameID}] initWorld: rejected - ${msg}`);
      return fail(msg);
    });
    result.onFailure((reason) => console.error(`[${gameID}] initWorld failure: ${reason}`));
    return result;
  }

  public async updateMap(map: Tile[], gameID: string, namespace: Namespace): Promise<Result> {
    const t0 = Date.now();
    const result = await this.gameRepository.getWorld(gameID);
    result.onFailure((r) => {
      console.warn(`[${gameID}] updateMap: failed to fetch world: ${r}`);
    });
    const updated = await result.flatMapAsync(async (w: World) => {
      if (w.gameState === 'Started') {
        const failure = fail('You cannot update the map once the game has started!');
        namespace.emit(SocketActions.newWorld, failure);
        console.warn(`[${gameID}] updateMap: rejected (already started)`);
        return failure;
      }
      const world = { ...w, map };
      await this.gameRepository.updateGame(gameID, world);
      namespace.emit(SocketActions.newWorld, success(world));
      console.info(`[${gameID}] updateMap: map updated (${map.length} tiles). Duration=${Date.now() - t0}ms`);
      return success(world);
    });
    updated.onFailure((r) => console.error(`[${gameID}] updateMap failure: ${r}`));
    return updated;
  }

  public async addPlayer(gameID: string, name: string): Promise<Result> {
    try {
      const result = await this.gameRepository.getWorld(gameID);
      const added = await result.flatMapAsync(async (w: World) => {
        if (w.gameState === 'Started') return success(w); // Spectator mode
        if (w.players.filter((p) => p.name === name).length > 0) {
          const msg = `Another player has already taken the name ${name}`;
          console.warn(`[${gameID}] addPlayer: ${msg}`);
          return fail(msg);
        }
        const player = new Player(name);
        const players = w.players.concat([player]);
        players.sort((x, y) => x.name.localeCompare(y.name));
        const world = { ...w, players };
        return this.gameRepository.updateGame(gameID, world);
      });
      added.onFailure((r) => console.error(`[${gameID}] addPlayer failure: ${r}`));
      if (added instanceof Success) {
        // success instance
        const world = (added as any).value as World;
        console.info(`[${gameID}] addPlayer: player='${name}' totalPlayers=${world.players.length}`);
      }
      return added;
    } catch (ex) {
      const msg = `Could not add player ${name}! Ex: ${ex}`;
      console.error(`[${gameID}] addPlayer exception:`, ex);
      return fail(msg);
    }
  }

  public async applyAction(id: string, action: Action): Promise<Result> {
    const start = Date.now();
    console.info(`[${id}] action: type=${action.type}`);
    try {
      if (action.type === 'undo') {
        const undoResult = await this.gameRepository.undoMove(id);
        undoResult.onFailure((r) => console.warn(`[${id}] action undo failed: ${r}`));
        if (undoResult instanceof Success) console.info(`[${id}] action undo success`);
        return undoResult;
      }
      const toApply = GameService.mapRules([action]);
      const result = await this.gameRepository.getWorld(id);
      const apply = toApply.reduce(ruleReducer, result);
      const final = await apply.flatMapAsync((w: World) => this.gameRepository.updateGame(id, w));
      final.onFailure((r) => console.error(`[${id}] action ${action.type} failure: ${r}`));
      if (final instanceof Success) {
        const world = (final as any).value as World;
        console.info(
          `[${id}] action ${action.type} success: duration=${Date.now() - start}ms currentPlayer=${world.players[world.currentPlayer].name}`,
        );
      }
      return final;
    } catch (err) {
      console.error(`[${id}] action ${action.type} exception`, err);
      return fail(`Action ${action.type} crashed: ${err}`);
    }
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
        case 'stealFromPlayer':
          return rules.StealFromPlayer(a);
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
