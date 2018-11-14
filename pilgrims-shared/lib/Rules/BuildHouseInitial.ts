import { BuildHouseInitialAction } from '../Action';
import { World, Result, purchase, House } from '../Shared';
import { ensureGameState, findPlayer, placeHouseInital } from './Helpers';

export const BuildHouseInitial = ({ parameters }: BuildHouseInitialAction) => (
  w: Result<World>,
) => {
  // todo check number;
  debugger;
  const stateEnsured = ensureGameState('Pregame')(w);
  const playerExists = findPlayer(parameters.playerName)(stateEnsured);
  const placed = placeHouseInital(parameters.coordinates)(
    parameters.playerName,
  )(playerExists);
  return placed;
};
