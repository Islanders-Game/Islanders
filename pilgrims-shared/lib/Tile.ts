import { HexCoordinate } from './HexCoordinate';

export interface Tile {
  type: 'Wood' | 'Stone' | 'Clay' | 'Grain' | 'Wool' | 'Desert' | 'Ocean';
  diceRoll: 'None' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  coord: HexCoordinate;
}
