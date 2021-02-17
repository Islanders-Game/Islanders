import { Player } from './Player';
import { Thief } from './Thief';
import { Tile, DiceRoll } from './Tile';
import { GameRules } from './GameRules';
import { GameStatistics } from './GameStatistics';

export type GameState = 'Uninitialized' | 'Pregame' | 'Started' | 'Finished';

export interface World {
  currentPlayer: number;
  currentDie: DiceRoll;
  players: Player[];
  thief?: Thief;
  lastThiefPosition?: Thief;
  map: Tile[];
  gameState: GameState;
  gameRules: GameRules;
  pointsToWin: number;
  winner: Player | undefined;
  gameStatistics: GameStatistics;
  version: number;
}

export class World implements World {
  constructor() {
    this.currentDie = 'None';
    this.currentPlayer = 0;
    this.gameRules = new GameRules();
    this.players = [];
    this.gameState = 'Uninitialized';
    this.map = [{
      type: 'Desert',
      diceRoll: 'None',
      coord: {
        x: 0, y: 0,
      },
    }];
    this.pointsToWin = 10;
    this.gameStatistics = new GameStatistics();
    this.thief = undefined;
    this.version = 0;
  }
}
