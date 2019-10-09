import { Result, World, success } from '../Shared';
import { assignInitalRessourcesToPlayers } from './Helpers';
import { LockMapAction } from '../Action';

export const LockMap = (_: LockMapAction) => (w: Result): Result =>
  w.flatMap((w: World) =>
    success({
      ...w,
      gameState: 'Pregame',
    }),
  );
