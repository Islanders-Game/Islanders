import { EndTurnAction } from '../Action';
import { Result, success } from './Result';
import { World } from '../World';
import { findPlayer, assignNextPlayerTurn } from './Helpers';

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
  const round = Math.floor(
    r.value.gameStatistics.turns / r.value.players.length,
  );
  let gameState = r.value.gameState;
  if (round == 2 && gameState === 'Pregame') {
    gameState = 'Started';
  }
  return success({ ...r.value, gameState: gameState });
};
