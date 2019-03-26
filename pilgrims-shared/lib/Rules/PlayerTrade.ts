import { PlayerTradeAction } from '../Action';
import { Result, World } from '../Shared';
import { findPlayer, hasResources, transferResources } from './Helpers';
import { empty } from '../Resources';

export const PlayerTrade = ({ parameters }: PlayerTradeAction) => (
  w: Result<World>,
): Result<World> => {
  const playerExists = findPlayer(parameters.playerName)(w);
  const otherPlayerExists = findPlayer(parameters.otherPlayerName)(
    playerExists,
  );
  const playerHas = hasResources(parameters.playerName, parameters.resources)(
    otherPlayerExists,
  );
  const otherHas = hasResources(parameters.playerName, parameters.resources)(
    playerHas,
  );
  const addToPlayerResources = transferResources(
    parameters.playerName,
    empty,
    parameters.resources,
  )(otherHas);
  const subtractOtherPlayerResources = transferResources(
    parameters.otherPlayerName,
    parameters.resources,
    empty,
  )(addToPlayerResources);
  return subtractOtherPlayerResources;
};
