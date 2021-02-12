import { EndTurnAction } from '../Action';
import { Result, success } from './Result';
import { World } from '../World';
import {
  findPlayer,
  assignNextPlayerTurn,
  assignInitalRessourcesToPlayers,
} from './Helpers';
import { GameState } from '../Shared';

export const EndTurn = ({ parameters }: EndTurnAction) => (
  world: Result,
): Result => 
  world
    .flatMap(findPlayer(parameters.playerName))
    // .flatMap(verifyThief(parameters.worldBefore))
    .flatMap(assignNextPlayerTurn)
    .flatMap(stateChanger)
    .flatMap(checkVictory(parameters.playerName));

const checkVictory = (playerName: string) => (w: World) => {
  const winner = w.players.find(
    (p) => p.points >= w.pointsToWin && p.name === playerName,
  )!;
  return winner ? success({ ...w, winner, gameState: 'Finished' }) : success(w);
};

// const verifyThief = (before: World) => (after: World) => {
//   if (before.currentDie === 7 && before.thief?.hexCoordinate !== after.thief?.hexCoordinate) {
//     return fail('You have to move the Thief this turn!');
//   }
//   return success(after);
// }

const stateChanger = (w: World): Result => {
  const round = Math.floor(w.gameStatistics.turns / w.players.length);
    if (round === 2 && w.gameState === 'Pregame') {
      const players = assignInitalRessourcesToPlayers(w);
      // initial resources
      const gameState: GameState = 'Started';
      return success({ ...w, gameState, players });
    } else {
      return success(w);
    }
  };
