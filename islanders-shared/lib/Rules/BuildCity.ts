import { BuildCityAction } from '../Action';
import { Result, purchase, City, World, success, fail } from '../Shared';
import { ensureGameState, findPlayer, placeCity, increasePointsForPlayer } from './Helpers';

export const BuildCity = ({ parameters }: BuildCityAction) => (w: Result): Result => w
  .flatMap(ensureGameState('Started'))
  .flatMap(findPlayer(parameters.playerName))
  .flatMap(cityIsWithinMaxAmount(parameters.playerName))
  .flatMap(purchase(new City().cost)(parameters.playerName))
  .flatMap(placeCity(parameters.coordinates)(parameters.playerName))
  .flatMap(increasePointsForPlayer(parameters.playerName));

const cityIsWithinMaxAmount = (playerName: string) => (w: World) => {
  const player = w.players.find((p) => p.name === playerName);
  if (!player) return fail(`Player: ${playerName} does not exist`);
  if (player.cities.length >= w.gameRules.maxCities) {
    return fail(`You cannot build more than ${w.gameRules.maxCities} cities in this game`);
  }
  return success(w);
};
