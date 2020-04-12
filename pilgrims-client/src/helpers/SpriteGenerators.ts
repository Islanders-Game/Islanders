import { Sprite } from 'pixi.js';

import { Tile } from '../../../pilgrims-shared/dist/Shared';

export function generateSprites(): { [s: string]: () => Sprite } {
  const tilePath = './img/tilesets/';
  const tileStyle = 'realistic';

  const sprites = {
    Clay: () => Sprite.from(`${tilePath}${tileStyle}/clay.png`),
    Desert: () => Sprite.from(`${tilePath}${tileStyle}/desert.png`),
    Grain: () => Sprite.from(`${tilePath}${tileStyle}/grain.png`),
    Wood: () => Sprite.from(`${tilePath}${tileStyle}/wood.png`),
    Stone: () => Sprite.from(`${tilePath}${tileStyle}/stone.png`),
    Wool: () => Sprite.from(`${tilePath}${tileStyle}/wool.png`),
    Ocean: () => Sprite.from(`${tilePath}${tileStyle}/ocean.png`),
    House: () => Sprite.from(`./img/pieces/house.png`),
    City: () => Sprite.from(`./img/pieces/city.png`),
    Thief: () => Sprite.from(`./img/pieces/thief.png`),
    Scorch: () => Sprite.from(`${tilePath}/shared/scorch-with-thief.png`),
    WoodHarbor: () =>
      Sprite.from(`${tilePath}${tileStyle}/woodharbor.png`),
    WoolHarbor: () =>
      Sprite.from(`${tilePath}${tileStyle}/woolharbor.png`),
    GrainHarbor: () =>
      Sprite.from(`${tilePath}${tileStyle}/grainharbor.png`),
    ClayHarbor: () =>
      Sprite.from(`${tilePath}${tileStyle}/clayharbor.png`),
    StoneHarbor: () =>
      Sprite.from(`${tilePath}${tileStyle}/stoneharbor.png`),
    ThreeToOneHarbor: () =>
      Sprite.from(`${tilePath}${tileStyle}/threetooneharbor.png`),
    2: () => Sprite.from(`./img/numbers/2.png`),
    3: () => Sprite.from(`./img/numbers/3.png`),
    4: () => Sprite.from(`./img/numbers/4.png`),
    5: () => Sprite.from(`./img/numbers/5.png`),
    6: () => Sprite.from(`./img/numbers/6.png`),
    8: () => Sprite.from(`./img/numbers/8.png`),
    9: () => Sprite.from(`./img/numbers/9.png`),
    10: () => Sprite.from(`./img/numbers/10.png`),
    11: () => Sprite.from(`./img/numbers/11.png`),
    12: () => Sprite.from(`./img/numbers/12.png`),
  };
  return sprites;
}

export function generateTile(tileWidth, tileHeight, tile: Tile, corner) {
  const generator = generateSprites()[tile.type.toString()];
  const s = generator();
  s.width = tileWidth;
  s.height = tileHeight;
  s.position.x = corner.x - tileWidth;
  s.position.y = corner.y - tileHeight / 2;
  return s;
}

export function generateSprite(
  type: string,
  tileWidth: number,
  center,
  origin,
) {
  const generator = generateSprites()[type];
  const s = generator();
  s.width = tileWidth / 4;
  s.height = s.width;
  s.anchor.x = 0.5;
  s.anchor.y = 0.5;
  s.position.x = center.x + origin.x;
  s.position.y = center.y + origin.y;
  return s;
}

export function generateThiefTile(
  type: 'Scorch' | 'Thief',
  tileWidth: number,
  tileHeight: number,
  corner: { x: number; y: number },
) {
  const generator = generateSprites()[type];
  const s = generator();
  s.width = tileWidth;
  s.height = tileHeight;
  s.position.x = corner.x - tileWidth;
  s.position.y = corner.y - tileHeight / 2;
  return s;
}

export function generateTileNumber(tileWidth, center, origin, tile: Tile) {
  if (tile.diceRoll === 'None') {
    return undefined;
  }
  const generator = generateSprites()[tile.diceRoll.toString()];
  const s = generator();
  s.width = tileWidth / 4;
  s.height = s.width;
  s.anchor.x = 0.5;
  s.anchor.y = 0.5;
  s.position.x = center.x + origin.x;
  s.position.y = center.y + origin.y;
  return s;
}
