import { BuildHouseInitialAction } from '../Action';
import { World, Result, fail, success, purchase, House } from '../Shared';
import { ensureGameState, findPlayer, placeHouseInital, increasePointsForPlayer } from './Helpers';

const checkNumberOfStructures = (w: World): Result => {
  const round = Math.floor(w.gameStatistics.turns / w.players.length);
  const currentPlayer = w.players[w.currentPlayer];

  const ordinal = (n: number) => {
    var s = ["th", "st", "nd", "rd"];
    var v = n%100;
    return n + (s[(v-20)%10] || s[v] || s[0]);
  }

  if (currentPlayer.houses.length > round) {
    return fail(
      `You cannot place a ${ordinal(currentPlayer.houses.length +
        1)} house in the ${ordinal(round + 1)} pre-game round!`,
    );
  }
  return success(w);
};

export const BuildHouseInitial = ({ parameters }: BuildHouseInitialAction) => (
  world: Result,
) =>
  // todo check number;
  world
    .flatMap(ensureGameState('Pregame'))
    .flatMap((w: World) => checkNumberOfStructures(w))
    .flatMap(findPlayer(parameters.playerName))
    .flatMap(placeHouseInital(parameters.coordinates)(parameters.playerName))
    .flatMap(increasePointsForPlayer(parameters.playerName));
