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
    .flatMap(verifyThief)
    .flatMap(assignNextPlayerTurn)
    .flatMap(stateChanger)
    .flatMap(checkVictory(parameters.playerName));

const checkVictory = (playerName: string) => (w: World) => {
  const winner = w.players.find(
    (p) => p.points >= w.pointsToWin && p.name === playerName,
  );
  return winner ? success({
    ...w, winner, gameState: 'Finished',
  }) : success(w);
};

const verifyThief = (w: World) => {
  if (w.currentDie !== 7) return success(w);
  if (!w.thief && w.lastThiefPosition) return fail('You have to move the Thief this turn');
  if (w.thief && w.lastThiefPosition && w.thief.hexCoordinate !== w.lastThiefPosition.hexCoordinate) {
    return fail('You have to move the Thief this turn');
  }
  return success(w);
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
