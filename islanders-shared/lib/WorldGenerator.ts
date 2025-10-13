import * as honeycombGrid from 'honeycomb-grid';
const { defineHex, Orientation } = honeycombGrid;
import { type Tile, type TileType, type HarborType } from './Tile';
import { getNeighbouringHexCoords } from './HexCoordinate';
import type { DiceRoll } from './Shared';

interface VoronoiSite {
  x: number;
  y: number;
  isLand: boolean;
  biome?: TileType;
}

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

const CANONICAL_COUNTS: Record<TileType, number> = {
  Wood: 4,
  Wool: 4,
  Grain: 4,
  Stone: 3,
  Clay: 3,
  Desert: 1,
  Ocean: 0,
  WoodHarbor: 0,
  WoolHarbor: 0,
  GrainHarbor: 0,
  ClayHarbor: 0,
  StoneHarbor: 0,
  ThreeToOneHarbor: 0,
};
const TOTAL_CANONICAL = 19;

const createHexagon = (Hex: any, center: any, radius: number): any[] => {
  const hexes: any[] = [center];

  for (let ring = 1; ring <= radius; ring++) {
    let hex = new Hex({ col: center.col, row: center.row - ring });

    const directions = [
      { col: 1, row: 0 }, // SE
      { col: 0, row: 1 }, // S
      { col: -1, row: 1 }, // SW
      { col: -1, row: 0 }, // NW
      { col: 0, row: -1 }, // N
      { col: 1, row: -1 }, // NE
    ];

    for (const dir of directions) {
      for (let i = 0; i < ring; i++) {
        hexes.push(hex);
        hex = new Hex({ col: hex.col + dir.col, row: hex.row + dir.row });
      }
    }
  }

  return hexes;
};
class SimpleNoise {
  private permutation: number[];

  constructor(seed?: number) {
    const random = seed !== undefined ? this.seededRandom(seed) : Math.random;
    this.permutation = Array.from({ length: 256 }, (_, i) => i);

    for (let i = this.permutation.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [this.permutation[i], this.permutation[j]] = [this.permutation[j]!, this.permutation[i]!];
    }
    this.permutation = [...this.permutation, ...this.permutation];
  }

  private seededRandom(seed: number): () => number {
    return () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);

    const u = this.fade(x);
    const v = this.fade(y);

    const a = this.permutation[X]! + Y;
    const aa = this.permutation[a]!;
    const ab = this.permutation[a + 1]!;
    const b = this.permutation[X + 1]! + Y;
    const ba = this.permutation[b]!;
    const bb = this.permutation[b + 1]!;

    return this.lerp(
      v,
      this.lerp(u, this.grad(this.permutation[aa]!, x, y), this.grad(this.permutation[ba]!, x - 1, y)),
      this.lerp(u, this.grad(this.permutation[ab]!, x, y - 1), this.grad(this.permutation[bb]!, x - 1, y - 1)),
    );
  }

  octaveNoise(x: number, y: number, octaves: number, persistence: number): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }

    return total / maxValue;
  }
}

const shuffleArray = <T>(input: T[]): T[] => {
  const array = [...input];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j]!, array[i]!];
  }
  return array;
};

const randomTileTypeGenerator = function* (): Generator<TileType> {
  let shuffledTiles = shuffleArray<TileType>(tileProbabilities);
  while (true) {
    if (shuffledTiles.length === 0) {
      shuffledTiles = shuffleArray(tileProbabilities);
    }
    yield shuffledTiles.pop() as TileType;
  }
};

const getHarborGenerator = function* (): Generator<HarborType> {
  let shuffledHarbors = shuffleArray<HarborType>(harborProbabilites);
  while (true) {
    if (shuffledHarbors.length === 0) {
      shuffledHarbors = shuffleArray(harborProbabilites);
    }
    yield shuffledHarbors.pop() as HarborType;
  }
};

export class WorldGenerator {
  public generateRandomMap(radius: number | undefined, generateIslands: number | undefined): Tile[] {
    const r = radius !== undefined ? Number(radius) : 3;
    const numIslands = generateIslands !== undefined ? Number(generateIslands) : 1;
    const Hex = defineHex({ dimensions: 30, orientation: Orientation.FLAT });

    const { tiles: mainTiles, landHexes: mainLandHexes } = this.generateStandardMainIsland(Hex);
    const map: Tile[] = [...mainTiles];

    this.addOceanAroundLand(map, mainLandHexes);
    this.addStandardHarborsForMain(map, mainLandHexes);

    if (numIslands > 1) {
      const { allHexes: additionalHexes, islands } = this.generateAdditionalIslands(Hex, numIslands - 1, r, 2);

      islands.forEach((islandHexes) => {
        if (islandHexes.length === 0) return;
        const islandTiles = this.generateProportionalIslandTiles(islandHexes);
        this.assignDiceRollsWithHotNumberSpacing(islandTiles);
        islandTiles.forEach((t) => map.push(t));
      });

      this.addOceanAroundLand(map, additionalHexes);
    }

    return map;
  }

  private generateStandardMainIsland(Hex: any): { tiles: Tile[]; landHexes: any[] } {
    const rawHexes: any[] = createHexagon(Hex, new Hex({ col: 0, row: 0 }), 2);

    let minCol = Infinity;
    let maxCol = -Infinity;
    rawHexes.forEach((h) => {
      if (h.col < minCol) minCol = h.col;
      if (h.col > maxCol) maxCol = h.col;
    });

    const columnSet = new Set<number>();
    rawHexes.forEach((h) => columnSet.add(h.col));
    const sortedCols = Array.from(columnSet).sort((a, b) => a - b);

    const leftCols = sortedCols.slice(0, 2);
    const rightCol = sortedCols[sortedCols.length - 1];

    const shifted = rawHexes.map((h) => {
      if (leftCols.includes(h.col)) {
        return new Hex({ col: h.col, row: h.row - 1 });
      }
      if (h.col === rightCol) {
        return new Hex({ col: h.col, row: h.row + 1 });
      }
      return h;
    });

    const seen = new Set<string>();
    const landHexes: any[] = [];
    for (const h of shifted) {
      const key = `${h.col},${h.row}`;
      if (!seen.has(key)) {
        seen.add(key);
        landHexes.push(h);
      }
    }

    const tiles: Tile[] = [];

    const tileTypeGen = randomTileTypeGenerator();
    landHexes.forEach((hex: any) => {
      tiles.push({
        coord: { x: hex.col, y: hex.row },
        diceRoll: 'None',
        type: tileTypeGen.next().value,
      });
    });

    const deserts = tiles.filter((t) => t.type === 'Desert');
    if (deserts.length === 0) {
      tiles[0]!.type = 'Desert';
    } else if (deserts.length > 1) {
      deserts.slice(1).forEach((d) => (d.type = 'Wood'));
    }

    this.assignDiceRollsWithHotNumberSpacing(tiles);
    return { tiles, landHexes };
  }

  private assignDiceRollsWithHotNumberSpacing(landTiles: Tile[]): void {
    const numbers = [...diceRollProbabilites];
    const attemptsLimit = 200;

    const isAdjacentHot = (tiles: Tile[]): boolean => {
      const hotCoords = tiles.filter((t) => t.diceRoll === 6 || t.diceRoll === 8).map((t) => t.coord);
      for (const coord of hotCoords) {
        const neighbours = getNeighbouringHexCoords(coord);
        if (
          neighbours.some((nc) =>
            tiles.some((t) => t.coord.x === nc.x && t.coord.y === nc.y && (t.diceRoll === 6 || t.diceRoll === 8)),
          )
        ) {
          return true;
        }
      }
      return false;
    };

    for (let attempt = 0; attempt < attemptsLimit; attempt++) {
      const shuffled = shuffleArray(numbers);
      let idx = 0;
      landTiles.forEach((tile) => {
        if (tile.type === 'Desert') {
          tile.diceRoll = 'None';
        } else {
          tile.diceRoll = shuffled[idx++]!;
        }
      });
      if (!isAdjacentHot(landTiles)) return;
    }
  }

  private addStandardHarborsForMain(map: Tile[], mainLandHexes: any[]): void {
    const getHarbor = getHarborGenerator();
    const mainLandSet = new Set(mainLandHexes.map((h: any) => `${h.col},${h.row}`));
    const coastal = map.filter((tile) => {
      if (tile.type !== 'Ocean') return false;
      const neighbours = getNeighbouringHexCoords(tile.coord);
      return neighbours.some((c) => mainLandSet.has(`${c.x},${c.y}`));
    });

    const sorted = coastal.sort((a, b) => {
      const aA = Math.atan2(a.coord.y, a.coord.x);
      const bA = Math.atan2(b.coord.y, b.coord.x);
      return aA - bA;
    });

    const numHarbors = 9;
    if (sorted.length === 0) return;
    const step = Math.max(1, Math.floor(sorted.length / numHarbors));
    let placed = 0;
    for (let i = 0; placed < numHarbors && i < sorted.length; i += step) {
      const tile = sorted[i];
      if (!tile) break;
      tile.type = getHarbor.next().value;
      placed++;
    }
  }

  private generateAdditionalIslands(
    Hex: any,
    numberOfAdditionalIslands: number,
    radius: number,
    mainIslandRadius: number,
  ): { allHexes: any[]; islands: any[][] } {
    const noise = new SimpleNoise(Date.now() + 999);
    const additionalLandHexes: any[] = [];
    const islandGroups: any[][] = [];

    const islandSites: VoronoiSite[] = [];

    for (let i = 0; i < numberOfAdditionalIslands; i++) {
      let attempts = 0;
      let newSite: VoronoiSite;

      do {
        const angle = (Math.PI * 2 * i) / numberOfAdditionalIslands + (Math.random() - 0.5) * 0.6;
        const minDistanceFromCenter = mainIslandRadius + 2;
        const distance = minDistanceFromCenter + radius * 1.2 + Math.random() * radius * 0.5;
        newSite = {
          x: Math.round(Math.cos(angle) * distance),
          y: Math.round(Math.sin(angle) * distance),
          isLand: true,
        };
        attempts++;
      } while (
        attempts < 10 &&
        islandSites.some((s) => Math.sqrt(Math.pow(s.x - newSite.x, 2) + Math.pow(s.y - newSite.y, 2)) < radius * 1.5)
      );

      islandSites.push(newSite);
      islandGroups.push([]);
    }

    const maxExtent = Math.max(radius * 5, 20);

    for (let q = -maxExtent; q <= maxExtent; q++) {
      for (let r = -maxExtent; r <= maxExtent; r++) {
        const hex = new Hex({ col: q, row: r });

        if (Math.sqrt(q * q + r * r) <= mainIslandRadius + 1) {
          continue;
        }

        for (let si = 0; si < islandSites.length; si++) {
          const site = islandSites[si];
          if (!site) continue;
          const dist = Math.sqrt(Math.pow(q - site.x, 2) + Math.pow(r - site.y, 2));

          const noiseValue = noise.octaveNoise(q * 0.12, r * 0.12, 4, 0.55);

          const islandRadius = Math.max(radius * 0.8, 2);

          const distanceFactor = Math.max(0, 1 - dist / (islandRadius * 1.3));
          const threshold = -0.2 + distanceFactor * 0.65;

          if (noiseValue > threshold && dist < islandRadius * 1.5) {
            additionalLandHexes.push(hex);
            islandGroups[si]!.push(hex);
            break;
          }
        }
      }
    }

    return { allHexes: additionalLandHexes, islands: islandGroups };
  }

  private addOceanAroundLand(map: Tile[], landHexes: any[]): void {
    const oceanSet = new Set<string>();
    landHexes.forEach((hex: any) => {
      const neighbours = getNeighbouringHexCoords({ x: hex.col, y: hex.row });
      neighbours.forEach((c) => {
        const key = `${c.x},${c.y}`;
        if (!landHexes.some((h: any) => h.col === c.x && h.row === c.y) && !oceanSet.has(key)) {
          oceanSet.add(key);
          map.push({
            coord: c,
            diceRoll: 'None',
            type: 'Ocean',
          });
        }
      });
    });
  }

  private generateProportionalIslandTiles(islandHexes: any[]): Tile[] {
    const desired: { type: TileType; exact: number; floor: number; frac: number }[] = [];
    const resourceTypes: TileType[] = ['Wood', 'Wool', 'Grain', 'Stone', 'Clay', 'Desert'];
    resourceTypes.forEach((t) => {
      const exact = (CANONICAL_COUNTS[t] / TOTAL_CANONICAL) * islandHexes.length;
      const floor = Math.floor(exact);
      desired.push({ type: t, exact, floor, frac: exact - floor });
    });
    let allocated = desired.reduce((sum, d) => sum + d.floor, 0);
    let remaining = islandHexes.length - allocated;
    desired.sort((a, b) => b.frac - a.frac);
    let di = 0;
    while (remaining > 0 && di < desired.length) {
      desired[di]!.floor++;
      remaining--;
      di++;
    }
    const desertEntry = desired.find((d) => d.type === 'Desert');
    if (desertEntry && desertEntry.floor > 1) desertEntry.floor = 1;
    if (desertEntry && desertEntry.floor === islandHexes.length)
      desertEntry.floor = Math.max(0, islandHexes.length - 1);

    const pool: TileType[] = [];
    desired.forEach((d) => {
      for (let i = 0; i < d.floor; i++) pool.push(d.type);
    });
    while (pool.length < islandHexes.length) pool.push('Wood');

    const shuffledPool = shuffleArray(pool);
    const tiles: Tile[] = [];
    islandHexes.forEach((hex: any, idx: number) => {
      const type = shuffledPool[idx]!;
      tiles.push({ coord: { x: hex.col, y: hex.row }, type, diceRoll: 'None' });
    });
    return tiles;
  }
}
