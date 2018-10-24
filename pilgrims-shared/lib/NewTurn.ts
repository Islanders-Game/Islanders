import { DiceRollType } from './Tile';

export interface NewTurn {
  playerName: string;
  diceRoll: DiceRollType;
}
