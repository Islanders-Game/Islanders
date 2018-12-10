import { Result, World, purchase, Road } from '../Shared';
import { MoveThiefDevCardAction } from '../Action';
import {
  ensureGameState,
  findPlayer,
  developmentCardHasNotBeenPlayed,
  moveThief,
} from './Helpers';

export const MoveThiefDevelopmentCard = ({
  parameters,
}: MoveThiefDevCardAction) => (w: Result<World>): Result<World> => {
  if (w.tag === 'Failure') {
    return w;
  }

  const stateEnsured = ensureGameState('Started')(w);
  const correctPlayer = findPlayer(parameters.playerName)(stateEnsured);
  const devCardHasNotBeenPlayed = developmentCardHasNotBeenPlayed(
    parameters.playedCard,
  )(correctPlayer);
  return moveThief(parameters.coordinates)(devCardHasNotBeenPlayed);
};
