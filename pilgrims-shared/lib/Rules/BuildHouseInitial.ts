import { BuildHouseAction } from '../Action';
import { World, Result, purchase, House } from '../Shared';
import { ensureGameState, findPlayer, placeHouseInital } from './Helpers';

export const BuildHouseInitial = ({ parameters }: BuildHouseAction) => (
  w: Result<World>,
) => {
  const stateEnsured = ensureGameState('Pregame')(w);
  const playerExists = findPlayer(parameters.playerName)(stateEnsured);
  const purchased = purchase(new House().cost)(parameters.playerName)(
    playerExists,
  );
  const placed = placeHouseInital(parameters.coordinates)(
    parameters.playerName,
  )(purchased);
  return placed;
};
