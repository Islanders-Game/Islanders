import { PlayerTradeAction } from '../Action';
import { fail, Result, success, World } from '../Shared';
import { findPlayer, hasResources, playerExists, transferResources } from './Helpers';
import { empty, Resources, resourcesAreNonNegative } from '../Resources';

export const PlayerTrade = ({ parameters }: PlayerTradeAction) => (
  w: Result,
): Result => w
  .flatMap(findPlayer(parameters.playerName))
  .flatMap(playerExists(parameters.otherPlayerName))
  .flatMap(validateResources(parameters.sentResources))
  .flatMap(validateResources(parameters.receivedResources))
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

const validateResources = (resources: Resources) => (w: World): Result => {
  return resourcesAreNonNegative(resources) ? success(w) : fail('You cannot trade negative resources')
}