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
}: MoveThiefDevCardAction) => (w: Result): Result =>
  w
    .flatMap(ensureGameState('Started'))
    .flatMap(findPlayer(parameters.playerName))
    .flatMap(developmentCardHasNotBeenPlayed(parameters.playedCard))
    .flatMap(moveThief(parameters.coordinates));
