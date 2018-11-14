import { defineGrid, extendHex, HexFactory, GridFactory } from 'honeycomb-grid';
import { Tile, TileType, DiceRollType, GeneratorDiceRollType } from './Tile';

const randomTileType = (): TileType => {
  const tileProbabilities: TileType[] = [
    'Wood',
    'Wood',
    'Wood',
    'Wood',
    'Wool',
    'Wool',
    'Wool',
    'Wool',
    'Grain',
    'Grain',
    'Grain',
    'Grain',
    'Stone',
    'Stone',
    'Stone',
    'Clay',
    'Clay',
    'Clay',
    'Desert',
  ];
  const rand = Math.floor(Math.random() * tileProbabilities.length);
  return tileProbabilities[rand];
};

const generatorDiceRoll = (): GeneratorDiceRollType => {
  // See https://www.catan.com/en/download/?SoC_rv_Rules_091907.pdf
  const roll = Math.random();
  if (roll <= 0.03) return 2;
  if (roll > 0.03 && roll <= 0.06) return 12;
  if (roll > 0.06 && roll <= 0.12) return 3;
  if (roll > 0.12 && roll <= 0.18) return 11;
  if (roll > 0.18 && roll <= 0.26) return 4;
  if (roll > 0.26 && roll <= 0.34) return 10;
  if (roll > 0.34 && roll <= 0.45) return 5;
  if (roll > 0.45 && roll <= 0.56) return 9;
  if (roll > 0.56 && roll <= 0.7) return 6;
  if (roll > 0.7 && roll <= 0.84) return 8;
  return generatorDiceRoll();
};

export class WorldGenerator {
  public generateRandomMap(
    radius: number | undefined,
    generateIslands: number | undefined,
  ): Tile[] {
    const Hex = extendHex({
      orientation: 'flat',
    });
    const r: number = radius !== undefined ? Number(radius) : 3;
    const Grid = defineGrid(Hex);
    const map: Tile[] = [];

    const mainlandCenter = Hex(0, 0);
    let grid = Grid.hexagon({ radius: r, center: mainlandCenter });

    if (generateIslands) {
      for (let i = 0; i < generateIslands; i++) {
        grid = grid.concat(
          Grid.hexagon({
            radius: Math.floor(r / 2),
            center: generateIslandCenter(r, Hex),
          }),
        );
      }
    }

    grid.forEach((hex) => {
      const tileType = randomTileType();
      const diceRoll = tileType === 'Desert' ? 'None' : generatorDiceRoll();
      map.push({
        coord: { x: hex.x, y: hex.y },
        diceRoll,
        type: tileType,
      });
    });
    return map;
  }
}

const generateIslandCenter = (
  r: number,
  hex: HexFactory<{
    orientation: string;
  }>,
) => {
  const angle = Math.random() * Math.PI * 2;
  const x = Math.ceil(Math.cos(angle) * (r * 2) + 1);
  const y = Math.ceil(Math.sin(angle) * (r * 2) + 1);
  const islandCenter = hex(x, y);
  return islandCenter;
};
