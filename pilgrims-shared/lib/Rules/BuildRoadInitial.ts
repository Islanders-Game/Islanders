import { BuildRoadInitialAction } from '../Action';
import { Result, World, fail, purchase, Road } from '../Shared';
import { findPlayer, placeRoad, ensureGameState } from './Helpers';

export const BuildRoadInitial = ({ parameters }: BuildRoadInitialAction) => (
  w: Result<World>,
): Result<World> => {
  // todo check number of roads.
  const ensuredState = ensureGameState('Pregame')(w);
  const numberOfStructureChecked = checkNumberOfStructures(ensuredState);
  const playerExists = findPlayer(parameters.playerName)(
    numberOfStructureChecked,
  );
  return placeRoad(parameters.start, parameters.end)(parameters.playerName)(
    playerExists,
  );
};

const checkNumberOfStructures = (r: Result<World>): Result<World> => {
  if (r.tag === 'Failure') {
    return r;
  }
  const round = Math.floor(
    r.value.gameStatistics.turns / r.value.players.length,
  );
  const currentPlayer = r.value.players[r.value.currentPlayer];
  if (currentPlayer.roads.length > round) {
    return fail(
      `Cannot place road number ${currentPlayer.roads.length +
        1} in pregame round ${round + 1}`,
    );
  }
  return r;
};
