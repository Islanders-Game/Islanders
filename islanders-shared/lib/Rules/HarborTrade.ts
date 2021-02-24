import { HarborTradeAction } from '../Action';
import { Resources, Result, World, fail, success, neighbouringHexCoords } from '../Shared';
import { HarborType } from '../Tile';
import { findPlayer,
  hasResources,
  transferResources } from './Helpers';

export const HarborTrade = ({ parameters }: HarborTradeAction) => (
  w: Result,
): Result => w
  .flatMap(findPlayer(parameters.playerName))
  .flatMap(playerHasHarbor(parameters.harborType))
  .flatMap(resourcesMatchHarbor(parameters.transfer, parameters.harborType))
  .flatMap(hasResources(parameters.playerName, parameters.transfer))
  .flatMap(
    transferResources(
      parameters.playerName,
      parameters.transfer,
      parameters.receive,
    ),
  );

const resourcesMatchHarbor = (check: Resources, harborType: HarborType) => (w: World): Result => {
  const failed = fail('The given resources do not match the harbor');
  const succeeded = success(w);
  switch (harborType) {
    case 'ClayHarbor':
      return check.clay >= 2 ? succeeded : failed;
    case 'GrainHarbor':
      return check.grain >= 2 ? succeeded : failed;
    case 'StoneHarbor':
      return check.stone >= 2 ? succeeded : failed;
    case 'WoodHarbor':
      return check.wood >= 2 ? succeeded : failed;
    case 'WoolHarbor':
      return check.wool >= 2 ? succeeded : failed;
    case 'ThreeToOneHarbor':
      return check.clay >= 3
        || check.grain >= 3
        || check.stone >= 3
        || check.wood >= 3
        || check.wool >= 3
        ? succeeded : failed;
    default:
      return fail('This harbor type does not exist');
  }
};

const playerHasHarbor = (harborType: HarborType) => (w: World): Result => {
  const player = w.players[w.currentPlayer];
  const tiles = w.map;
  const hasHarbor = player.houses.some((house) =>
    neighbouringHexCoords(house.position)
      .some((h) => tiles
        .some((t) => t.coord.x === h.x && t.coord.y === h.y && t.type === harborType)));
  if (!hasHarbor) {
    return fail('You do not have a house on a harbor for this trade');
  }
  return success(w);
};
