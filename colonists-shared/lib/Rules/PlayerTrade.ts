import { PlayerTradeAction } from '../Action';
import { Result, World } from '../Shared';
import { findPlayer, hasResources, transferResources } from './Helpers';
import { empty } from '../Resources';

export const PlayerTrade = ({ parameters }: PlayerTradeAction) => (
  w: Result,
): Result =>
  w
    .flatMap(findPlayer(parameters.playerName))
    .flatMap(findPlayer(parameters.otherPlayerName))
    .flatMap(hasResources(parameters.playerName, parameters.resources))
    .flatMap(hasResources(parameters.playerName, parameters.resources))
    .flatMap(
      transferResources(parameters.playerName, empty, parameters.resources),
    )
    .flatMap(
      transferResources(
        parameters.otherPlayerName,
        parameters.resources,
        empty,
      ),
    );
