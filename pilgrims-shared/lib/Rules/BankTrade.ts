import { BankTradeAction } from '../Action';
import { Result, World } from '../Shared';
import { findPlayer, hasResources, transferResources } from './Helpers';

export const BankTrade = ({ parameters }: BankTradeAction) => (
  w: Result<World>,
): Result<World> => {
  const playerExists = findPlayer(parameters.playerName)(w);
  const has = hasResources(parameters.transfer)(playerExists);
  return transferResources(
    parameters.playerName,
    parameters.transfer,
    parameters.receive,
  )(has);
};
