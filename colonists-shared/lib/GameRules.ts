export type GameType = 'original' | 'speed' | 'realtime';

export interface GameRules {
  gameType: GameType;
  rounds: number;
  pointsToWin: number;
  maxRoads: number;
  maxHouses: number;
  maxCities: number;
}
export class GameRules implements GameRules {
  constructor() {
    this.gameType = 'original';
    this.rounds = -1;
    this.pointsToWin = 10;
    this.maxRoads = 15;
    this.maxHouses = 10;
    this.maxCities = 6;
  }
}
