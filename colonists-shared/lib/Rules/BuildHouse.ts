import { Result } from './Result';
import { ensureGameState, findPlayer, purchase, placeHouse, increasePointsForPlayer } from './Helpers';
import { House } from '../Shared';
import { BuildHouseAction } from '../Action';

export const BuildHouse = ({ parameters }: BuildHouseAction) => (
  w: Result,
): Result => w
  .flatMap(ensureGameState('Started'))
  .flatMap(findPlayer(parameters.playerName))
  .flatMap(purchase(new House().cost)(parameters.playerName))
  .flatMap(placeHouse(parameters.coordinates)(parameters.playerName))
  .flatMap(increasePointsForPlayer(parameters.playerName));
