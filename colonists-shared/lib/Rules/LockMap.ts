import { Result, World, success } from '../Shared';
import { LockMapAction } from '../Action';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const LockMap = (_: LockMapAction) => (world: Result): Result => world.flatMap((w: World) => success({
  ...w,
  gameState: 'Pregame',
}));
