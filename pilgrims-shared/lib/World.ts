import { Player } from './Player';
import { Thief } from './Thief';
import { Tile, DiceRollType } from './Tile';
import { GameRules } from './GameRules';

export type GameState = 'Uninitialized' | 'Started' | 'Finished';

export interface World {
  currentPlayer: number;
  currentDie: DiceRollType;
  players: Player[];
  thief?: Thief;
  map: Tile[];
  gameState: GameState;
  gameRules: GameRules;
  pointsToWin: number;
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
  }
}

export const randomGameDiceRoll = (): DiceRollType => {
  // See https://www.catan.com/en/download/?SoC_rv_Rules_091907.pdf
  const roll = Math.random();
  if (roll <= 0.03) return 2;
  if (roll > 0.03 && roll <= 0.06) return 12;
  if (roll > 0.06 && roll <= 0.12) return 3;
  if (roll > 0.12 && roll <= 0.18) return 11;
  if (roll > 0.18 && roll <= 0.26) return 4;
  if (roll > 0.26 && roll <= 0.34) return 10;
  if (roll > 0.34 && roll <= 0.45) return 5;
  if (roll > 0.45 && roll <= 0.56) return 9;
  if (roll > 0.56 && roll <= 0.70) return 6;
  if (roll > 0.70 && roll <= 0.84) return 8;
  /*(roll > 0.84 && roll <= 1.00)*/ return 7;
};
