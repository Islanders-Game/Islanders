import { BuildRoadAction } from '../Action';
import { Result, purchase, Road } from '../Shared';
import { findPlayer, placeRoad } from './Helpers';

export const BuildRoad = ({ parameters }: BuildRoadAction) => (w: Result): Result => w
  .flatMap(findPlayer(parameters.playerName))
  .flatMap(purchase(new Road().cost)(parameters.playerName))
  .flatMap(
    placeRoad(parameters.start, parameters.end)(parameters.playerName),
  );
