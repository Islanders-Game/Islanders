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

const resourcesMatchHarbor = (check: Resources, harborType: HarborType) => (w: World): Result => {
  const e = fail('The given resources do not match the harbor');
  const s = success(w);
  switch (harborType) {
    case 'ClayHarbor':
      return check.clay >= 2 ? s : e;
    case 'GrainHarbor':
      return check.grain >= 2 ? s : e;
    case 'StoneHarbor':
      return check.grain >= 2 ? s : e;
    case 'WoodHarbor':
      return check.grain >= 2 ? s : e;
    case 'WoolHarbor':
      return check.grain >= 2 ? s : e;
    case 'ThreeToOneHarbor':
      return check.clay >= 3 || check.grain >= 3 || check.stone >= 3 || check.wood >= 3 || check.wool >= 3 ? s : e;
    default:
      return fail('Undefined Harbor');
  }
};

const playerHasHarbor = (playerName: string, harborType: HarborType) => (w: World): Result => {
  const player = w.players[w.currentPlayer];
  const tiles = w.map;
  const hasHarbor = player.houses.some((house) => {
    const hexes = neighbouringHexCoords(house.position);
    return hexes.some((h) => {
      const tile = tiles.find((t) => t.coord.x === h.x && t.coord.y === h.y);
      return tile && tile.type === harborType;
    });
  });
  if (!hasHarbor) {
    return fail('You do not have a house on a harbor for this trade');
  }
  return success(w);
};
