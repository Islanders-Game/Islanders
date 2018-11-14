import { PlayCardAction } from '../Action';
import { Result, World } from '../Shared';
import { ensureGameState, playCard } from './Helpers';

export const PlayCard = ({ parameters }: PlayCardAction) => (
  w: Result<World>,
): Result<World> => {
  const stateEnsured = ensureGameState('Started')(w);
  return playCard(
    parameters.playerName,
    parameters.card,
    parameters.chosenResources,
  )(stateEnsured);
};
