import { HarborTradeAction } from '../Action';
import { Result } from '../Shared';
import { findPlayer,
  hasResources,
  transferResources,
  resourcesMatchHarbor,
  playerHasHarbor } from './Helpers';

export const HarborTrade = ({ parameters }: HarborTradeAction) => (
  w: Result,
): Result => w
  .flatMap(findPlayer(parameters.playerName))
  .flatMap(playerHasHarbor(parameters.playerName, parameters.harborType))
  .flatMap(resourcesMatchHarbor(parameters.transfer, parameters.harborType))
  .flatMap(hasResources(parameters.playerName, parameters.transfer))
  .flatMap(
    transferResources(
      parameters.playerName,
      parameters.transfer,
      parameters.receive,
    ),
  );
