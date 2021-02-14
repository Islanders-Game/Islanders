import { BuildRoadInitialAction } from '../Action';
import { Result, World, fail } from '../Shared';
import { findPlayer, placeRoad, ensureGameState } from './Helpers';
import { success } from './Result';

const checkNumberOfStructures = (w: World): Result => {
  const round = Math.floor(w.gameStatistics.turns / w.players.length);
  const currentPlayer = w.players[w.currentPlayer];
  if (currentPlayer.roads.length > round) {
    return fail(
      `Cannot place road number ${currentPlayer.roads.length +
        1} in pregame round ${round + 1}`,
    );
  }
  return success(w);
};

export const BuildRoadInitial = ({ parameters }: BuildRoadInitialAction) => (
  world: Result,
): Result =>
  // todo check number of roads.
  world
    .flatMap(ensureGameState('Pregame'))
    .flatMap((w: World) => checkNumberOfStructures(w))
    .flatMap(findPlayer(parameters.playerName))
    .flatMap(
      placeRoad(parameters.start, parameters.end)(parameters.playerName),
    );
