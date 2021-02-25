import { defineGrid, extendHex, HexFactory } from 'honeycomb-grid';
import { Tile, TileType, HarborType, findTileInMap } from './Tile';
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

const diceRollProbabilites: DiceRoll[] = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];

function shuffleArray<T>(input: T[]): T[] {
  const array = [...input];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function convertToTiles(map: Tile[], hexes: HexCoordinate[]): Tile[] {
  const optTiles = hexes.map((x) => findTileInMap(map, x));
  const res = optTiles.filter((x): x is Tile => x !== undefined);
  return res;
}

function* randomTileNumberGenerator(): Generator<DiceRoll> {
  let shuffledDiceRollProbabilites = shuffleArray<DiceRoll>(diceRollProbabilites);
  while (true) {
    if (shuffledDiceRollProbabilites.length === 0) {
      shuffledDiceRollProbabilites = shuffleArray(diceRollProbabilites);
    }
    yield shuffledDiceRollProbabilites.pop() as DiceRoll;
  }
}

function* randomTileTypeGenerator(): Generator<TileType> {
  let shuffledTiles = shuffleArray<TileType>(tileProbabilities);
  while (true) {
    if (shuffledTiles.length === 0) {
      shuffledTiles = shuffleArray(tileProbabilities);
    }
    yield shuffledTiles.pop() as TileType;
  }
}

function* getHarborGenerator(): Generator<HarborType> {
  let shuffledHarbors = shuffleArray<HarborType>(harborProbabilites);
  while (true) {
    if (shuffledHarbors.length === 0) {
      shuffledHarbors = shuffleArray(harborProbabilites);
    }
    yield shuffledHarbors.pop() as HarborType;
  }
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

    const getHarbor = getHarborGenerator();
    const randomTileType = randomTileTypeGenerator();
    const randomTileNumber = randomTileNumberGenerator();

    // set the tile type for each hex in the grid
    grid.forEach((hex) => {
      const tileType = randomTileType.next().value;
      const diceRoll = tileType === 'Desert' ? 'None' : randomTileNumber.next().value;
      map.push({
        coord: {
          x: hex.x,
          y: hex.y,
        },
        diceRoll,
        type: tileType,
      });
    });

    // add water around each hex if it is not part of the hex
    grid.forEach((hex) => {
      const neighbours = getNeighbouringHexCoords(hex.coordinates());
      neighbours.forEach((c) => {
        if (!grid.get(c)) {
          map.push({
            coord: c,
            diceRoll: 'None',
            type: 'Ocean',
          });
        }
      });
    });

    // add harbors
    map.forEach((startingTile) => {
      if (startingTile?.type === 'Ocean') {
        // neighboursTilePath will consists solely of ocean tiles:
        const neighboursTilePath = [startingTile];
        while (neighboursTilePath.length > 0) {
          const tile = neighboursTilePath.pop()!; // we know its not undefined since it wasnt empty
          const neighbourTiles = convertToTiles(map, getNeighbouringHexCoords(tile.coord));
          if (!neighbourTiles.some((t) => tileIsHarbor(t))) {
            tile.type = getHarbor.next().value;
          }
          neighboursTilePath.push(...neighbourTiles.filter((nt) => nt.type === 'Ocean'));
        }
      }
    });

    return map;
  }
}

const coordinateIsHarbor = (hc: HexCoordinate, map: Tile[]) => {
  const tile = findTileInMap(map, hc);
  return tile !== undefined && tileIsHarbor(tile);
};

const tileIsHarbor = (tile: Tile) =>
  tile &&
  (tile.type === 'ClayHarbor' ||
    tile.type === 'GrainHarbor' ||
    tile.type === 'StoneHarbor' ||
    tile.type === 'ThreeToOneHarbor' ||
    tile.type === 'WoodHarbor' ||
    tile.type === 'WoolHarbor');

const generateIslandCenter = (r: number, hex: HexFactory<{ orientation: 'flat' }>) => {
  const angle = Math.random() * Math.PI * 2;
  const x = Math.ceil(Math.cos(angle) * (r * 2) + 1);
  const y = Math.ceil(Math.sin(angle) * (r * 2) + 1);
  const islandCenter = hex(x, y);
  return islandCenter;
};
