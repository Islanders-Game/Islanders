import { Result, World, purchase, Road } from '../Shared';
import { MoveThiefAction } from '../Action';
import {
  diceRollWasSeven,
  ensureGameState,
  moveThief,
  findPlayer,
} from './Helpers';

export const MoveThief = ({ parameters }: MoveThiefAction) => (
  w: Result<World>,
): Result<World> => {
  if (w.tag === 'Failure') {
    return w;
  }
  const stateEnsured = ensureGameState('Started')(w);
  const correctPlayer = findPlayer(parameters.playerName)(stateEnsured);
  const was7 = diceRollWasSeven(correctPlayer);
  return moveThief(parameters.coordinates)(was7);
};
