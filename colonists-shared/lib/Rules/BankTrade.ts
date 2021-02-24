import { BankTradeAction } from '../Action';
import { fail, Resources, Result, success, World } from '../Shared';
import { findPlayer, hasResources, transferResources } from './Helpers';

export const BankTrade = ({ parameters }: BankTradeAction) => (
  w: Result,
): Result => w
  .flatMap(findPlayer(parameters.playerName))
  .flatMap(hasResources(parameters.playerName, parameters.transfer))
  .flatMap(resourcesAreOfSameType(parameters.transfer))
  .flatMap(
    transferResources(
      parameters.playerName,
      parameters.transfer,
      parameters.receive,
    ),
  );

const resourcesAreOfSameType = (toValidate: Resources) => (w: World) => {
  const has4IdenticalResources =
       toValidate.clay >= 4
    || toValidate.stone >= 4
    || toValidate.wood >= 4
    || toValidate.wool >= 4
    || toValidate.grain >= 4;

  if (!has4IdenticalResources) return fail('You have to trade 4 of the same resource with the bank');
  return success(w);
};
