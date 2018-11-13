import { Player } from './Player';
import { Thief } from './Thief';
import { Tile, DiceRollType } from './Tile';
import { GameRules } from './GameRules';
import { GameStatistics } from './GameStatistics';

export type GameState = 'Uninitialized' | 'Pregame' | 'Started' | 'Finished';

export interface World {
  currentPlayer: number;
  currentDie: DiceRollType;
  players: Player[];
  thief?: Thief;
  map: Tile[];
  gameState: GameState;
  gameRules: GameRules;
  pointsToWin: number;
  gameStatistics: GameStatistics;
}

export class World implements World {
  constructor() {
    this.currentDie = 'None';
    this.currentPlayer = 0;
    this.gameRules = new GameRules();
    this.players = [];
    this.gameState = 'Uninitialized';
    this.map = [{ type: 'Desert', diceRoll: 'None', coord: { x: 0, y: 0 } }];
    this.pointsToWin = 0;
    this.gameStatistics = new GameStatistics();
  }
}
