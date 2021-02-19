import { EndTurnAction } from '../Action';
import { Result, success, fail } from './Result';
import { World } from '../World';
import { findPlayer, assignNextPlayerTurn, assignRessourcesToPlayers } from './Helpers';
import { GameState, Tile } from '../Shared';

export const EndTurn = ({ parameters }: EndTurnAction) => (
  world: Result,
): Result =>
  world
    .flatMap(findPlayer(parameters.playerName))
    .flatMap(verifyTurnConditions)
    .flatMap(assignNextPlayerTurn)
    .flatMap(stateChanger)
    .flatMap(checkVictory(parameters.playerName))
    .flatMap(setTurnConditions);

const checkVictory = (playerName: string) => (w: World) => {
  const winner = w.players.find(
    (p) => p.points >= w.pointsToWin && p.name === playerName,
  );
  return winner ? success({
    ...w, winner, gameState: 'Finished',
  }) : success(w);
};

const stateChanger = (w: World): Result => {
  const round = Math.floor(w.gameStatistics.turns / w.players.length);
  if (round === 2 && w.gameState === 'Pregame') {
    const initialFilter = (tile: Tile) =>
      w.gameState === 'Pregame'
      && !(w.thief && w.thief.hexCoordinate.x === tile.coord.x && w.thief.hexCoordinate.y === tile.coord.y);

    const players = assignRessourcesToPlayers(w, initialFilter);
    const gameState: GameState = 'Started';
    return success({
      ...w, gameState, players,
    });
  }
  return success(w);
};

const setTurnConditions = (w: World): Result =>
  w.currentDie === 7
    ? success({ ...w, conditions: { rolledASeven: { movedThief: false, stoleFromPlayer: false } } })
    : success({ ...w, conditions: { } });

const verifyTurnConditions = (w: World): Result => {
  if (w.conditions.playedRoadBuilding) {
    const { roadsBuilt } = w.conditions.playedRoadBuilding;
    const { expected } = w.conditions.playedRoadBuilding;
    if (roadsBuilt < expected) {
      return fail('You need to build the roads you gained from Road Building');
    }
  }
  if (w.conditions.playedKnight) {
    const { movedThief } = w.conditions.playedKnight;
    const { stoleFromPlayer } = w.conditions.playedKnight;
    if (!movedThief) return fail('You need to move the thief');
    if (!stoleFromPlayer) return fail('You need to take resources from a player with a building surrounding the thief');
  }
  if (w.conditions.rolledASeven) {
    const { movedThief } = w.conditions.rolledASeven;
    const { stoleFromPlayer } = w.conditions.rolledASeven;
    if (!movedThief) return fail('You need to move the thief');
    if (!stoleFromPlayer) return fail('You need to take resources from a player with a building surrounding the thief');
  }
  return success(w);
};
