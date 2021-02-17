import { Result, World, fail, success } from '../Shared';
import { MoveThiefDevCardAction } from '../Action';
import { ensureGameState,
  findPlayer,
  moveThiefUsingKnight } from './Helpers';
import { DevelopmentCard } from '../Entities/DevelopmentCard';

export const MoveThiefDevelopmentCard = ({ parameters }: MoveThiefDevCardAction) => (w: Result): Result => w
  .flatMap(ensureGameState('Started'))
  .flatMap(findPlayer(parameters.playerName))
  .flatMap(developmentCardHasNotBeenPlayed(parameters.playedCard))
  .flatMap(moveThiefUsingKnight(parameters.coordinates));

const developmentCardHasNotBeenPlayed = (developmentCard: DevelopmentCard) => (w: World): Result => {
  if (developmentCard.played) {
    return fail('This card has already been played');
  }
  return success(w);
};
