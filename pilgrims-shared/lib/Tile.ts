import { HexCoordinate } from './HexCoordinate';

export type TileType = 'Wood' | 'Stone' | 'Clay' | 'Grain' | 'Wool' | 'Desert' | 'Ocean';
export type DiceRollType = 'None' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export interface Tile {
  type: TileType;
  diceRoll: DiceRollType;
  coord: HexCoordinate;
}
