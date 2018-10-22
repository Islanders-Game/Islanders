export type GameType = 'original' | 'speed' | 'realtime';

export interface GameRules {
    gameType: GameType;
    rounds: number;
    pointsToWin: number;
    maxRoads: number;
    maxHouses: number;
    maxCities: number;
}

