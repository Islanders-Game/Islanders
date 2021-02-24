import { ProposeTradeAction } from '../Action';
import { Result } from '../Shared';
import { findPlayer, hasResources, transferResources } from './Helpers';
import { empty } from '../Resources';

export const ProposeTrade = ({ parameters }: ProposeTradeAction) => (
  w: Result,
): Result => w
  .flatMap(findPlayer(parameters.playerName))
  .flatMap(hasResources(parameters.playerName, parameters.resources));
  // TODO: Implement emitting proposed trade.