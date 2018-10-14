import { Player } from './Player';
import { Thief } from './Thief';
import { Tile } from './Tile';

export interface World {
  players: Player[];
  thief?: Thief;
  map: Tile[];
}
