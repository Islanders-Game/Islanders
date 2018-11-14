import { Result } from '../Result';
import { World } from '../World';
import { ensureGameState, findPlayer, purchase, placeHouse } from './Helpers';
import { House } from '../Shared';
import { BuildHouseAction } from '../Action';

export const BuildHouse = ({ parameters }: BuildHouseAction) => (
  w: Result<World>,
): Result<World> => {
  const stateEnsured = ensureGameState('Started')(w);
  const playerExists = findPlayer(parameters.playerName)(stateEnsured);
  const purchased = purchase(new House().cost)(parameters.playerName)(
    playerExists,
  );
  const placed = placeHouse(parameters.coordinates)(parameters.playerName)(
    purchased,
  );
  return placed;
};
