import { BuildRoadInitialAction } from '../Action';
import { Result, World, purchase, Road } from '../Shared';
import { findPlayer, placeRoad, ensureGameState } from './Helpers';

export const BuildRoadInitial = ({ parameters }: BuildRoadInitialAction) => (
  w: Result<World>,
): Result<World> => {
  // todo check number of roads.
  const ensuredState = ensureGameState('Pregame')(w);
  const playerExists = findPlayer(parameters.playerName)(ensuredState);
  return placeRoad(parameters.start, parameters.end)(parameters.playerName)(
    playerExists,
  );
};
