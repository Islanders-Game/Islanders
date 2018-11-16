import { BuildRoadAction } from '../Action';
import { Result, World, purchase, Road } from '../Shared';
import { findPlayer, placeRoad } from './Helpers';

export const BuildRoad = ({ parameters }: BuildRoadAction) => (
  w: Result<World>,
) => {
  const playerExists = findPlayer(parameters.playerName)(w);
  const purchased = purchase(new Road().cost)(parameters.playerName)(
    playerExists,
  );
  return placeRoad(parameters.start, parameters.end)(parameters.playerName)(
    purchased,
  );
};
