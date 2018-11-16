import { PlayCardAction } from '../Action';
import { Result, World } from '../Shared';
import { ensureGameState, playCard, findPlayer } from './Helpers';

export const PlayCard = ({ parameters }: PlayCardAction) => (
  w: Result<World>,
): Result<World> => {
  const stateEnsured = ensureGameState('Started')(w);
  const validatePlayer = findPlayer(parameters.playerName)(stateEnsured);
  return playCard(
    parameters.playerName,
    parameters.card,
    parameters.chosenResources,
  )(validatePlayer);
};
