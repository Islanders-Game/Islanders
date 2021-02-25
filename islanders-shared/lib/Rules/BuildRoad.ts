import { BuildRoadAction } from '../Action';
import { Result, purchase, Road, World, success, fail } from '../Shared';
import { findPlayer, placeRoad } from './Helpers';

export const BuildRoad = ({ parameters }: BuildRoadAction) => (w: Result): Result => w
  .flatMap(findPlayer(parameters.playerName))
  .flatMap(roadIsWithinMaxAmount(parameters.playerName))
  .flatMap(purchase(new Road().cost)(parameters.playerName))
  .flatMap(
    placeRoad(parameters.start, parameters.end)(parameters.playerName),
  );

const roadIsWithinMaxAmount = (playerName: string) => (w: World) => {
  const player = w.players.find((p) => p.name === playerName);
  if (!player) return fail(`Player: ${playerName} does not exist`);
  if (player.roads.length >= w.gameRules.maxRoads) {
    return fail(`You cannot build more than ${w.gameRules.maxRoads} roads in this game`);
  }
  return success(w);
};
