import { Result, World, success } from '../Shared';
import { assignRessourcesToPlayers } from './Helpers';

export const StartGame = () => (w: Result<World>): Result<World> => {
  if (w.tag === 'Failure') {
    return w;
  }
  const players = assignRessourcesToPlayers(w, 'None', false);
  const world: World = {
    ...w.value,
    players,
    gameState: 'Started',
  };
  return success(world);
};
