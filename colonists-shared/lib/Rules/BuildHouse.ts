import { Result } from './Result';
import { ensureGameState, findPlayer, purchase, placeHouse, increasePointsForPlayer } from './Helpers';
import { HexCoordinate, House, Player } from '../Shared';
import { BuildHouseAction } from '../Action';

export const BuildHouse = ({ parameters }: BuildHouseAction) => (
  w: Result,
): Result => w
  .flatMap(ensureGameState('Started'))
  .flatMap(findPlayer(parameters.playerName))
  .flatMap(purchase(new House().cost)(parameters.playerName))
  .flatMap(placeHouse(parameters.coordinates)(parameters.playerName)(hasRoad))
  .flatMap(increasePointsForPlayer(parameters.playerName));

const hasRoad = (coord: HexCoordinate, p: Player) => p.roads.some(
  (r) => (r.start.x === coord.x && r.start.y === coord.y) || (r.end.x === coord.x && r.end.y === coord.y),
);
