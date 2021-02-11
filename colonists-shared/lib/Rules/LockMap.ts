import { Result, World, success } from '../Shared';
import { assignInitalRessourcesToPlayers } from './Helpers';
import { LockMapAction } from '../Action';

export const LockMap = (_: LockMapAction) => (world: Result): Result =>
  world.flatMap((w: World) =>
    success({
      ...w,
      gameState: 'Pregame',
    }),
  );
