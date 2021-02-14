import { BuildCityAction } from '../Action';
import { Result, purchase, City } from '../Shared';
import { ensureGameState, findPlayer, placeCity, increasePointsForPlayer } from './Helpers';

export const BuildCity = ({ parameters }: BuildCityAction) => (w: Result): Result => w
  .flatMap(ensureGameState('Started'))
  .flatMap(findPlayer(parameters.playerName))
  .flatMap(purchase(new City().cost)(parameters.playerName))
  .flatMap(placeCity(parameters.coordinates)(parameters.playerName))
  .flatMap(increasePointsForPlayer(parameters.playerName));
