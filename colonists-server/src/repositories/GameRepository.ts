import {
  World,
  Result,
  fail,
  success,
} from '../../../colonists-shared/dist/Shared';
import monk from 'monk';
import { ObjectId } from 'mongodb';

export class GameRepository {
  private mongoURL: string;
  private tableName = 'games';
  constructor(dbConnectionString: string) {
    this.mongoURL = dbConnectionString;
  }

  public async createGame(world: World): Promise<string> {
    const db = monk(this.mongoURL);
    const result: { _id: string } = await db.get(this.tableName).insert(world);
    db.close();
    return result._id;
  }

  public async updateGame(gameId: string, world: World): Promise<Result> {
    const db = monk(this.mongoURL);
    try {
      await db.get(this.tableName).update(new ObjectId(gameId), world, { replace: true});
      return success(world);
    } catch (ex) {
      return fail(ex);
    } finally {
      db.close();
    }
  }

  public async getWorld(gameId: string): Promise<Result> {
    const db = monk(this.mongoURL);
    try {
      const result = await db.get(this.tableName).findOne(new ObjectId(gameId)) as World;
      if (!result) {
        return fail(`World with id: ${gameId} not found!`);
      }
      return success(result);
    } catch (ex) {
      return fail(ex);
    } finally {
      db.close();
    }
  }
}
