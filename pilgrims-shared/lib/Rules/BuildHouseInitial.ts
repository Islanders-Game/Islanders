import { BuildHouseInitialAction } from '../Action';
import { World, Result, fail, purchase, House } from '../Shared';
import { ensureGameState, findPlayer, placeHouseInital } from './Helpers';

export const BuildHouseInitial = ({ parameters }: BuildHouseInitialAction) => (
  w: Result<World>,
) => {
  // todo check number;
  const ensuredState = ensureGameState('Pregame')(w);
  const numberOfStructureChecked = checkNumberOfStructures(ensuredState);
  const playerExists = findPlayer(parameters.playerName)(
    numberOfStructureChecked,
  );
  const placed = placeHouseInital(parameters.coordinates)(
    parameters.playerName,
  )(playerExists);
  return placed;
};

const checkNumberOfStructures = (r: Result<World>): Result<World> => {
  if (r.tag === 'Failure') {
    return r;
  }
  const round = Math.floor(
    r.value.gameStatistics.turns / r.value.players.length,
  );
  const currentPlayer = r.value.players[r.value.currentPlayer];
  if (currentPlayer.houses.length > round) {
    return fail(
      `Cannot place house number ${currentPlayer.houses.length +
        1} in pregame round ${round + 1}`,
    );
  }
  return r;
};
