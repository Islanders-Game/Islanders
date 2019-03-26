import { BuildCityAction } from '../Action';
import { Result, World, purchase, City } from '../Shared';
import { ensureGameState, findPlayer, placeCity } from './Helpers';

export const BuildCity = ({ parameters }: BuildCityAction) => (
  w: Result<World>,
) => {
  const stateEnsured = ensureGameState('Started')(w);
  const playerExists = findPlayer(parameters.playerName)(stateEnsured);
  const purchased = purchase(new City().cost)(parameters.playerName)(
    playerExists,
  );
  return placeCity(parameters.coordinates)(parameters.playerName)(purchased);
};
