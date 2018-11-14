import { EndTurnAction } from '../Action';
import { Result } from './Result';
import { World } from '../World';
import { findPlayer, assignNextPlayerTurn } from './Helpers';

export const EndTurn = ({ parameters }: EndTurnAction) => (
  w: Result<World>,
): Result<World> => {
  const playerEnsuredWorld = findPlayer(parameters.playerName)(w);
  const playerAssigned = assignNextPlayerTurn(playerEnsuredWorld);
  return playerAssigned;
};
