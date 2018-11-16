import { EndTurnAction } from '../Action';
import { Result, success } from './Result';
import { World } from '../World';
import {
  findPlayer,
  assignNextPlayerTurn,
  assignInitalRessourcesToPlayers,
  randomGameDiceRoll,
} from './Helpers';
import { GameState } from '../Shared';

export const EndTurn = ({ parameters }: EndTurnAction) => (
  w: Result<World>,
): Result<World> => {
  const playerEnsuredWorld = findPlayer(parameters.playerName)(w);
  const playerAssigned = assignNextPlayerTurn(playerEnsuredWorld);
  const stateChanged = stateChanger(playerAssigned);
  const victory = checkVictory(parameters.playerName)(stateChanged);
  return victory;
};

const checkVictory = (playerName: string) => (r: Result<World>) => {
  if (r.tag === 'Failure') {
    return r;
  }

  const winner = r.value.players.find(
    (p) => p.points >= r.value.pointsToWin && p.name === playerName,
  )!;
  if (winner) {
    return success({ winner, gameState: 'Finished', ...r.value });
  }

  return r;
};

const stateChanger = (r: Result<World>): Result<World> => {
  if (r.tag === 'Failure') {
    return r;
  }

  const round = Math.floor(
    r.value.gameStatistics.turns / r.value.players.length,
  );
  if (round == 2 && r.value.gameState === 'Pregame') {
    const players = assignInitalRessourcesToPlayers(r);
    // initial resources
    const gameState: GameState = 'Started';
    return success({ ...r.value, gameState, players });
  } else {
    return r;
  }
};
