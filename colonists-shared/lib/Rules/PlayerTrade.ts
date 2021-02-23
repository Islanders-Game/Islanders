import { PlayerTradeAction } from '../Action';
import { Result } from '../Shared';
import { findPlayer, hasResources, transferResources } from './Helpers';
import { empty } from '../Resources';

export const PlayerTrade = ({ parameters }: PlayerTradeAction) => (
  w: Result,
): Result => w
  .flatMap(findPlayer(parameters.playerName))
  .flatMap(findPlayer(parameters.otherPlayerName))
  .flatMap(hasResources(parameters.playerName, parameters.sentResources))
  .flatMap(hasResources(parameters.otherPlayerName, parameters.receivedResources))
  .flatMap(
    transferResources(parameters.playerName, empty, parameters.receivedResources),
  )
  .flatMap(
    transferResources(
      parameters.otherPlayerName,
      parameters.sentResources,
      empty,
    ),
  );
