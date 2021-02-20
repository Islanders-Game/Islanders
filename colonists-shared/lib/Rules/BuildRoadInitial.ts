import { BuildRoadInitialAction } from '../Action';
import { Result, World, fail } from '../Shared';
import { findPlayer, placeRoad, ensureGameState } from './Helpers';
import { success } from './Result';

const checkNumberOfStructures = (w: World): Result => {
  const round = Math.floor(w.gameStatistics.turns / w.players.length);
  const currentPlayer = w.players[w.currentPlayer];

  const ordinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  if (currentPlayer.roads.length > round) {
    return fail(
      `You cannot place a ${ordinal(
        currentPlayer.roads.length + 1,
      )} road in the ${ordinal(round + 1)} pre-game round`,
    );
  }
  return success({ ...w, conditions: { ...w.conditions, mustPlaceInitialRoad: { hasPlaced: true } } });
};

export const BuildRoadInitial = ({ parameters }: BuildRoadInitialAction) => (
  world: Result,
): Result =>
  world
    .flatMap(ensureGameState('Pregame'))
    .flatMap(checkNumberOfStructures)
    .flatMap(findPlayer(parameters.playerName))
    .flatMap(
      placeRoad(parameters.start, parameters.end)(parameters.playerName),
    );
