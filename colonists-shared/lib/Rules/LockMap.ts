import { Result, World, success } from '../Shared';
import { LockMapAction } from '../Action';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const LockMap = (a: LockMapAction) => (world: Result): Result =>
  world.flatMap((w: World) => success({
    ...w,
    conditions: { mustPlaceInitialHouse: { hasPlaced: false }, mustPlaceInitialRoad: { hasPlaced: false } },
    gameState: 'Pregame',
    pointsToWin: a.pointsToWin,
  }));
