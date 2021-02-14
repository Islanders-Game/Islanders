import { BankTradeAction } from '../Action';
import { Result } from '../Shared';
import { findPlayer, hasResources, transferResources } from './Helpers';

export const BankTrade = ({ parameters }: BankTradeAction) => (
  w: Result,
): Result => w
  .flatMap(findPlayer(parameters.playerName))
  .flatMap(hasResources(parameters.playerName, parameters.transfer))
  .flatMap(
    transferResources(
      parameters.playerName,
      parameters.transfer,
      parameters.receive,
    ),
  );
