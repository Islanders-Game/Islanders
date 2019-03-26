import { Result, World, success } from '../Shared';
import { assignInitalRessourcesToPlayers } from './Helpers';
import { LockMapAction } from '../Action';

export const LockMap = (_: LockMapAction) => (
  w: Result<World>,
): Result<World> => {
  if (w.tag === 'Failure') {
    return w;
  }
  const world: World = {
    ...w.value,
    gameState: 'Pregame',
  };
  return success(world);
};
