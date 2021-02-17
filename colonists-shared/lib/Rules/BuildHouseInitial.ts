import { BuildHouseInitialAction } from '../Action';
import { World, Result, fail, success, HexCoordinate, Player } from '../Shared';
import { ensureGameState,
  findPlayer,
  increasePointsForPlayer,
  placeHouse } from './Helpers';

const checkNumberOfStructures = (w: World): Result => {
  const round = Math.floor(w.gameStatistics.turns / w.players.length);
  const currentPlayer = w.players[w.currentPlayer];

  const ordinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  if (currentPlayer.houses.length > round) {
    return fail(
      `You cannot place a ${ordinal(
        currentPlayer.houses.length + 1,
      )} house in the ${ordinal(round + 1)} pre-game round`,
    );
  }
  return success(w);
};

export const BuildHouseInitial = ({ parameters }: BuildHouseInitialAction) => (
  world: Result,
): Result =>
  // todo check number;
  world
    .flatMap(ensureGameState('Pregame'))
    .flatMap((w: World) => checkNumberOfStructures(w))
    .flatMap(findPlayer(parameters.playerName))
    .flatMap(placeHouse(parameters.coordinates)(parameters.playerName)(hasRoad))
    .flatMap(increasePointsForPlayer(parameters.playerName));

const hasRoad = (coordinate: HexCoordinate, p: Player) => true;
