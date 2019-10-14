import { BuildCityAction } from '../Action';
import { Result, World, purchase, City } from '../Shared';
import { ensureGameState, findPlayer, placeCity } from './Helpers';

export const BuildCity = ({ parameters }: BuildCityAction) => (w: Result) =>
  w
    .flatMap(ensureGameState('Started'))
    .flatMap(findPlayer(parameters.playerName))
    .flatMap(purchase(new City().cost)(parameters.playerName))
    .flatMap(placeCity(parameters.coordinates)(parameters.playerName));
