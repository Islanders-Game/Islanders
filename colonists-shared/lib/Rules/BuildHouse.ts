import { Result } from './Result';
import { ensureGameState, findPlayer, purchase, placeHouse, increasePointsForPlayer } from './Helpers';
import { fail, HexCoordinate, House, Player, success, World } from '../Shared';
import { BuildHouseAction } from '../Action';

export const BuildHouse = ({ parameters }: BuildHouseAction) => (
  w: Result,
): Result => w
  .flatMap(ensureGameState('Started'))
  .flatMap(findPlayer(parameters.playerName))
  .flatMap(houseNumberIsUnderLimit(parameters.playerName))
  .flatMap(purchase(new House().cost)(parameters.playerName))
  .flatMap(placeHouse(parameters.coordinates)(parameters.playerName)(hasRoad))
  .flatMap(increasePointsForPlayer(parameters.playerName));

const hasRoad = (coord: HexCoordinate, p: Player) => p.roads.some(
  (r) => (r.start.x === coord.x && r.start.y === coord.y) || (r.end.x === coord.x && r.end.y === coord.y),
);

const houseNumberIsUnderLimit = (playerName: string) => (w: World) => {
  const player = w.players.find((p) => p.name === playerName);
  if (!player) return fail(`Player: ${playerName} does not exist`);
  if (player.houses.length >= w.gameRules.maxHouses) {
    return fail(`You cannot build more than ${w.gameRules.maxHouses} houses in this game`);
  }
  return success(w);
};
