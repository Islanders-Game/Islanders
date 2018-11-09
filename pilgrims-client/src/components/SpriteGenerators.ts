import { Sprite } from 'pixi.js';

import { Tile } from '../../../pilgrims-shared/dist/Shared';

export function generateSprites(): { [s: string]: () => Sprite } {
  const tilePath = './img/tilesets/';
  const tileStyle = 'watercolor';

  const sprites = {
    Clay: () => Sprite.fromImage(`${tilePath}${tileStyle}/clay.png`),
    Desert: () => Sprite.fromImage(`${tilePath}${tileStyle}/desert.png`),
    Grain: () => Sprite.fromImage(`${tilePath}${tileStyle}/grain.png`),
    Wood: () => Sprite.fromImage(`${tilePath}${tileStyle}/wood.png`),
    Stone: () => getAnimatedStoneSprite(tilePath),
    Wool: () => getAnimatedWoolSprite(tilePath),
    Ocean: () => Sprite.fromImage(`${tilePath}${tileStyle}/ocean.png`),
    House: () => Sprite.fromImage(`./img/pieces/house.png`),
    City: () => Sprite.fromImage(`./img/pieces/city.png`),
    2: () => Sprite.fromImage(`./img/numbers/2.png`),
    3: () => Sprite.fromImage(`./img/numbers/3.png`),
    4: () => Sprite.fromImage(`./img/numbers/4.png`),
    5: () => Sprite.fromImage(`./img/numbers/5.png`),
    6: () => Sprite.fromImage(`./img/numbers/6.png`),
    8: () => Sprite.fromImage(`./img/numbers/8.png`),
    9: () => Sprite.fromImage(`./img/numbers/9.png`),
    10: () => Sprite.fromImage(`./img/numbers/10.png`),
    11: () => Sprite.fromImage(`./img/numbers/11.png`),
    12: () => Sprite.fromImage(`./img/numbers/12.png`),
  };
  return sprites;
}

function getAnimatedWoolSprite(tilePath: string) {
  const textures = [
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/woolf.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool1.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool1f.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool2.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool2f.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool3.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool3f.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool4.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool4f.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool5.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool5f.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool6.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool6f.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool7.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool7f.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool8.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool8f.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool9.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool9f.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool10.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool10f.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool11.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool11f.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool12.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool12f.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool13.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool13f.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/wool_animated/wool14.png`),
  ];
  const anim = new PIXI.extras.AnimatedSprite(textures);
  anim.animationSpeed = 0.2;
  anim.play();
  return anim;
}

function getAnimatedStoneSprite(tilePath: string) {
  const textures = [
    PIXI.Texture.fromImage(`${tilePath}/watercolor/stone_animated/stone.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/stone_animated/stone1.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/stone_animated/stone2.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/stone_animated/stone3.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/stone_animated/stone4.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/stone_animated/stone5.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/stone_animated/stone6.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/stone_animated/stone7.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/stone_animated/stone8.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/stone_animated/stone9.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/stone_animated/stone10.png`),
    PIXI.Texture.fromImage(`${tilePath}/watercolor/stone_animated/stone11.png`),
  ];
  const anim = new PIXI.extras.AnimatedSprite(textures);
  anim.animationSpeed = 0.1;
  anim.play();
  return anim;
}

export function generateTile(
  tileWidth,
  tileHeight,
  tile: Tile,
  corner,
  lineWidth,
) {
  const generator = generateSprites()[tile.type.toString()];
  const s = generator();
  s.width = tileWidth;
  s.height = tileHeight;
  s.position.x = corner.x - tileWidth - lineWidth / 2;
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
