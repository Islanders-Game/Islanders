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
  return stateChanged;
};

const stateChanger = (r: Result<World>): Result<World> => {
  if (r.tag === 'Failure') {
    return r;
  }

  if (r.value.players.some((p) => p.points >= r.value.pointsToWin)) {
    return success({ gameState: 'Finished', ...r.value });
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
