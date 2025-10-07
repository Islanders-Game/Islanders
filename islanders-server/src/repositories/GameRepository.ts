import knex, { Knex } from 'knex';
import { World, Result, fail, success } from '../../../islanders-shared/lib/Shared';

type GameRow = {
  game_id: string;
  version: number;
  world: World | string;
};

export class GameRepository {
  private readonly db: Knex;

  private tableName = 'games';

  constructor(connection: string) {
    this.db = knex({
      client: 'pg',
      connection,
      pool: {
        min: 1,
        max: 10,
      },
    });
  }

  public async createGame(world: World): Promise<{ id: string }> {
    const worldToPersist = this.withVersion(world, 0);

    const result = (await this.db(this.tableName)
      .insert({
        version: worldToPersist.version,
        world: worldToPersist,
      })
      .returning('game_id')) as Array<{ game_id: string }>;

    return { id: result[0].game_id };
  }

  public async updateGame(gameID: string, world: World): Promise<Result> {
    try {
      const nextVersion = world.version + 1;
      const worldToPersist = this.withVersion(world, nextVersion);

      await this.db(this.tableName).insert({
        game_id: gameID,
        version: worldToPersist.version,
        world: worldToPersist,
      });

      return success(worldToPersist);
    } catch (ex) {
      return fail(`Failed to update game ${gameID}: ${String(ex)}`);
    }
  }

  public async getWorld(gameId: string): Promise<Result> {
    try {
      const row = (await this.db(this.tableName).where({ game_id: gameId }).orderBy('version', 'desc').first()) as
        | GameRow
        | undefined;
      if (!row) {
        return fail(`World with id: ${gameId} not found!`);
      }

      const world = this.deserializeWorld(row);
      return success(world);
    } catch (ex) {
      return fail(`Failed to fetch world ${gameId}: ${String(ex)}`);
    }
  }

  public async undoMove(gameID: string): Promise<Result> {
    const result = await this.getWorld(gameID);
    return result.flatMapAsync(async (current) => {
      const currentVersion = current.version;
      if (currentVersion - 1 === 0 || current.gameState === 'Finished') return fail('You cannot undo further back');
      const lastRow = (await this.db(this.tableName)
        .where({ game_id: gameID, version: currentVersion - 1 })
        .orderBy('version', 'desc')
        .first()) as GameRow | undefined;
      if (!lastRow) {
        return fail('You can not undo further back');
      }

      const lastVersion = this.deserializeWorld(lastRow);

      if (lastVersion.currentPlayer !== current.currentPlayer || lastVersion.gameState === 'Uninitialized') {
        return fail('You can not undo further back');
      }

      await this.db(this.tableName).where({ game_id: gameID, version: currentVersion }).del();
      return success(lastVersion);
    });
  }

  private withVersion(world: World, version: number): World {
    return { ...world, version };
  }

  private deserializeWorld(row: GameRow): World {
    const storedWorld = typeof row.world === 'string' ? JSON.parse(row.world) : row.world;
    return { ...(storedWorld as World), version: row.version };
  }
}
