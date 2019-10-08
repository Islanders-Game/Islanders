import { EndTurnAction } from '../Action';
import { Result, success } from './Result';
import { World } from '../World';
import {
  findPlayer,
  assignNextPlayerTurn,
  assignInitalRessourcesToPlayers,
} from './Helpers';
import { GameState } from '../Shared';

export const EndTurn = ({ parameters }: EndTurnAction) => (w: Result): Result =>
  w
    .flatMap(findPlayer(parameters.playerName))
    .flatMap((w: World) => assignNextPlayerTurn(w))
    .flatMap((w: World) => stateChanger(w))
    .flatMap(checkVictory(parameters.playerName));

const checkVictory = (playerName: string) => (w: World) => {
  const winner = w.players.find(
    (p) => p.points >= w.pointsToWin && p.name === playerName,
  )!;
  return winner ? success({ winner, gameState: 'Finished', ...w }) : success(w);
};

const stateChanger = (w: World): Result => {
  const round = Math.floor(w.gameStatistics.turns / w.players.length);
  if (round == 2 && w.gameState === 'Pregame') {
    const players = assignInitalRessourcesToPlayers(w);
    // initial resources
    const gameState: GameState = 'Started';
    return success({ ...w, gameState, players });
  } else {
    return success(w);
  }
};
