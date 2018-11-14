import { Result, World, purchase, Road } from '../Shared';
import { PlaceThiefAction } from '../Action';
import { findPlayer, placeRoad } from './Helpers';

export const MoveThief = ({ parameters }: PlaceThiefAction) => (
  w: Result<World>,
): Result<World> => {
  // todo
  return w;
};
