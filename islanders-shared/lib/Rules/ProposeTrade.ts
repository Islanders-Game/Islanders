import { ProposeTradeAction } from '../Action';
import { Result } from '../Shared';
import { findPlayer, hasResources } from './Helpers';

export const ProposeTrade = ({ parameters }: ProposeTradeAction) => (
  w: Result,
): Result => w
  .flatMap(findPlayer(parameters.playerName))
  .flatMap(hasResources(parameters.playerName, parameters.resources));