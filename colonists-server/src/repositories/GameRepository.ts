import {
  World,
  Result,
  fail,
  success,
} from '../../../colonists-shared/dist/Shared';
import monk from 'monk';
import { ObjectId } from 'mongodb';

interface DBWorld extends World {
  _id: { id: ObjectId, version: number}
}

export class GameRepository {
  private mongoURL: string;
  private tableName = 'games';
  constructor(dbConnectionString: string) {
    this.mongoURL = dbConnectionString;
  }

  public async createGame(world: World): Promise<string> {
    const db = monk(this.mongoURL);
    const dBWorld = world as DBWorld;
    dBWorld._id = { id: new ObjectId(), version: 0 };
    const result: { _id: { id: string, version: number } } = await db.get(this.tableName).insert(dBWorld);
    db.close();
    return result._id.id;
  }

  public async updateGame(gameID: string, world: World): Promise<Result> {
    const db = monk(this.mongoURL);
    try {
      const updatedVersion = { ...world, _id: { id: new ObjectId(gameID), version: world.version+1}, version: world.version+1 };
      await db.get(this.tableName).insert(updatedVersion);
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
      const result: DBWorld[] = await db.get(this.tableName).find({'_id.id': new ObjectId(gameId), '_id.version': { $exists: true}}, { sort : { version : -1 }});
      if (!result || result.length < 1) {
        return fail(`World with id: ${gameId} not found!`);
      }
      return success(result[0]);
    } catch (ex) {
      return fail(ex);
    } finally {
      db.close();
    }
  }

  public async undoMove(gameID: string): Promise<Result> {
    const result = await this.getWorld(gameID);
    const db = monk(this.mongoURL);
    return result.flatMapAsync(async (current) => {
      const currentVersion = current.version;
      if (currentVersion-1 === 0 || current.gameState === 'Finished') return fail('You can not undo further back!');
      const lastVersion: DBWorld = await db.get(this.tableName).findOne({ _id : { id: new ObjectId(gameID), version: currentVersion-1}});
      if (lastVersion.currentPlayer !== current.currentPlayer || lastVersion.gameState === 'Uninitialized') return fail('You can not undo further back!');
      await db.get(this.tableName).remove({ _id : { id: new ObjectId(gameID), version: currentVersion}});
      return success(lastVersion);
    });
  }
}
