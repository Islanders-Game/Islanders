import {
  World,
  Result,
  fail,
  success,
} from '../../../pilgrims-shared/dist/Shared';
import monk from 'monk';
import { ObjectId } from 'mongodb';

export class GameRepository {
  private mongoURL: string;
  private tableName: string = 'games';
  constructor(dbConnectionString: string) {
    this.mongoURL = dbConnectionString;
  }

  public async createGame(world: World): Promise<Result<string>> {
    const db = monk(this.mongoURL);
    try {
      const result = await db.get(this.tableName).insert(world);
      return success(result._id);
    } catch (ex) {
      return fail(ex);
    } finally {
      db.close();
    }
  }

  public async updateGame(gameId: string, world: World): Promise<Result<any>> {
    const db = monk(this.mongoURL);
    try {
      await db.get(this.tableName).update(new ObjectId(gameId), world);
      return success(undefined);
    } catch (ex) {
      return fail(ex);
    } finally {
      db.close();
    }
  }

  public async getWorld(gameId: string): Promise<Result<World>> {
    const db = monk(this.mongoURL);
    try {
      const result = await db.get(this.tableName).findOne(new ObjectId(gameId));
      if (!result) {
        // todo don't know if this is neccesary
        return fail(`World with id: ${gameId} not found`);
      }
      return success(result as World);
    } catch (ex) {
      return fail(ex);
    } finally {
      db.close();
    }
  }
}
