import { Result } from '../Shared';
import { MoveThiefDevCardAction } from '../Action';
import { ensureGameState,
  findPlayer,
  moveThiefUsingKnight } from './Helpers';

export const MoveThiefDevelopmentCard = ({ parameters }: MoveThiefDevCardAction) => (w: Result): Result => w
  .flatMap(ensureGameState('Started'))
  .flatMap(findPlayer(parameters.playerName))
  .flatMap(moveThiefUsingKnight(parameters.coordinates));
