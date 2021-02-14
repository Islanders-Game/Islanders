import { Result } from '../Shared';
import { MoveThiefAction } from '../Action';
import { diceRollWasSeven,
  ensureGameState,
  moveThief,
  findPlayer } from './Helpers';

export const MoveThief = ({ parameters }: MoveThiefAction) => (
  world: Result,
): Result => world
  .flatMap(ensureGameState('Started'))
  .flatMap(findPlayer(parameters.playerName))
  .flatMap(diceRollWasSeven)
  .flatMap(moveThief(parameters.coordinates));
