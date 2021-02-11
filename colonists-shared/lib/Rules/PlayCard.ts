import { PlayCardAction } from '../Action';
import { Result, World } from '../Shared';
import { ensureGameState, playCard, findPlayer } from './Helpers';

export const PlayCard = ({ parameters }: PlayCardAction) => (
  w: Result,
): Result =>
  w
    .flatMap(ensureGameState('Started'))
    .flatMap(findPlayer(parameters.playerName))
    .flatMap(
      playCard(
        parameters.playerName,
        parameters.card,
        parameters.chosenResources,
      ),
    );
