import { Player } from './Player';
import { Thief } from './Thief';
import { Tile } from './Tile';
import { GameRules } from './GameRules';

export interface World {
  currentPlayer: number;
  players: Player[];
  thief?: Thief;
  map: Tile[];
  started: boolean;
  gameRules: GameRules;
}

export class World implements World {
  constructor() {
    this.currentPlayer = 0;
    this.gameRules = new GameRules();
    this.players = [];
    this.started = false;
    this.map = [{ type: 'Desert', diceRoll: 'None', coord: { x: 0, y: 0 } }];
  }
}
