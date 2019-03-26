import { HarborTradeAction } from '../Action';
import { Result, World } from '../Shared';
import {
  findPlayer,
  hasResources,
  transferResources,
  resourcesMatchHarbor,
  playerHasHarbor,
} from './Helpers';

export const HarborTrade = ({ parameters }: HarborTradeAction) => (
  w: Result<World>,
): Result<World> => {
  const playerExists = findPlayer(parameters.playerName)(w);
  const ownsHarbor = playerHasHarbor(
    parameters.playerName,
    parameters.harborType,
  )(playerExists);
  const matches = resourcesMatchHarbor(
    parameters.transfer,
    parameters.harborType,
  )(ownsHarbor);
  const has = hasResources(parameters.playerName, parameters.transfer)(matches);
  return transferResources(
    parameters.playerName,
    parameters.transfer,
    parameters.receive,
  )(has);
};
