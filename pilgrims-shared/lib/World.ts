import { Player } from './Player';
import { Thief } from './Thief';
import { Tile } from './Tile';
import { GameRules } from './GameRules';

export interface World {
  currentPlayer: undefined | string;
  players: Player[];
  thief?: Thief;
  map: Tile[];
  started: boolean;
  gameRules: GameRules;
}
