import { defineGrid, extendHex, HexFactory } from 'honeycomb-grid';
import { Tile, TileType, HarborType } from './Tile';
import { getNeighbouringHexCoords } from './HexCoordinate';
import { DiceRoll, HexCoordinate } from './Shared';

const harborProbabilites: HarborType[] = [
  'WoodHarbor',
  'WoolHarbor',
  'GrainHarbor',
  'ClayHarbor',
  'StoneHarbor',
  'ThreeToOneHarbor',
  'ThreeToOneHarbor',
  'ThreeToOneHarbor',
  'ThreeToOneHarbor',
];

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

const diceRollProbabilites: DiceRoll[] = [
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
];

function shuffleArray<T>(input: T[]): T[] {
  const array = [...input];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export class WorldGenerator {
  // eslint-disable-next-line class-methods-use-this
  public generateRandomMap(radius: number | undefined, generateIslands: number | undefined): Tile[] {
    const mainHex = extendHex({
      orientation: 'flat',
    });
    const r: number = radius !== undefined ? Number(radius) : 3;
    const Grid = defineGrid(mainHex);
    const map: Tile[] = [];

    const mainlandCenter = mainHex(0, 0);
    let grid = Grid.hexagon({
      radius: r,
      center: mainlandCenter,
    });

    if (generateIslands && generateIslands > 1) {
      for (let i = 0; i < generateIslands; i++) {
        grid = grid.concat(
          Grid.hexagon({
            radius: Math.floor(r / 1.5),
            center: generateIslandCenter(r, mainHex),
          }),
        );
      }
    }

    let shuffledHarbors = shuffleArray<HarborType>(harborProbabilites);
    const getHarbor = (): HarborType => {
      if (shuffledHarbors.length === 0) {
        shuffledHarbors = shuffleArray(harborProbabilites);
      }
      return shuffledHarbors.pop() as HarborType;
    };

    let shuffledTiles = shuffleArray<TileType>(tileProbabilities);
    const randomTileType = (): TileType => {
      if (shuffledTiles.length === 0) {
        shuffledTiles = shuffleArray(tileProbabilities);
      }
      return shuffledTiles.pop() as TileType;
    };

    let shuffledDiceRollProbabilites = shuffleArray<DiceRoll>(diceRollProbabilites);
    const randomTileNumber = (): DiceRoll => {
      if (shuffledDiceRollProbabilites.length === 0) {
        shuffledDiceRollProbabilites = shuffleArray(diceRollProbabilites);
      }
      return shuffledDiceRollProbabilites.pop() as DiceRoll;
    };

    grid.forEach((hex) => {
      const tileType = randomTileType();
      const diceRoll = tileType === 'Desert' ? 'None' : randomTileNumber();

      const neighbours = getNeighbouringHexCoords(hex.coordinates());
      neighbours.forEach((c) => {
        if (!grid.get(c)) {
          const neighboursNeighbour = getNeighbouringHexCoords(c);
          if (neighboursNeighbour.some((hc) => coordinateIsHarbor(hc, map))) {
            map.push({
              coord: c,
              diceRoll: 'None',
              type: 'Ocean',
            });
          } else {
            map.push({
              coord: c,
              diceRoll: 'None',
              type: getHarbor(),
            });
          }
        }
      });

      map.push({
        coord: {
          x: hex.x,
          y: hex.y,
        },
        diceRoll,
        type: tileType,
      });
    });

    return map;
  }
}

const coordinateIsHarbor = (hc: HexCoordinate, map: Tile[]) => {
  const tile = map.find((h) => h.coord.x === hc.x && h.coord.y === hc.y);
  return tile &&
    (tile.type === 'ClayHarbor' ||
      tile.type === 'GrainHarbor' ||
      tile.type === 'StoneHarbor' ||
      tile.type === 'ThreeToOneHarbor' ||
      tile.type === 'WoodHarbor' ||
      tile.type === 'WoolHarbor');
};

const generateIslandCenter = (r: number, hex: HexFactory<{ orientation: 'flat' }>) => {
  const angle = Math.random() * Math.PI * 2;
  const x = Math.ceil(Math.cos(angle) * (r * 2) + 1);
  const y = Math.ceil(Math.sin(angle) * (r * 2) + 1);
  const islandCenter = hex(x, y);
  return islandCenter;
};
