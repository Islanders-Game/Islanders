import { BuildHouseInitialAction } from '../Action';
import { World, Result, fail, success, purchase, House } from '../Shared';
import { ensureGameState, findPlayer, placeHouseInital } from './Helpers';

const checkNumberOfStructures = (w: World): Result => {
  const round = Math.floor(w.gameStatistics.turns / w.players.length);
  const currentPlayer = w.players[w.currentPlayer];
  if (currentPlayer.houses.length > round) {
    return fail(
      `Cannot place house number ${currentPlayer.houses.length +
        1} in pregame round ${round + 1}`,
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
    .flatMap(placeHouseInital(parameters.coordinates)(parameters.playerName));
