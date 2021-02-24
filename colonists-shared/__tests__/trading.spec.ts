import { BankTradeAction, PlayerTradeAction } from "../lib/Action";
import { GameStatistics, Player, rules, success, World } from "../lib/Shared";

/* 
* Trading
*/
describe('Rules when trading with other players', () => {
    test('A player trading with another player will lose the resource traded away', () => {
      const p1: Player = new Player('P1');
      p1.resources = { wood: 1, wool: 0, stone: 0, grain: 0, clay: 0 };

      const p2: Player = new Player('P2');
      p2.resources = { wood: 0, wool: 1, stone: 0, grain: 0, clay: 0 };

      const w: World = {
        currentDie: 2,
        currentPlayer: 0,
        map: [],
        players: [p1, p2],
        winner: undefined,
        pointsToWin: 0,
        gameState: 'Started',
        gameStatistics: new GameStatistics(),
        version: 0,
        conditions: {},
        gameRules: {
          gameType: 'original',
          maxCities: 0,
          maxHouses: 0,
          maxRoads: 0,
          pointsToWin: 0,
          rounds: 0,
        },
      };

      const initialResult = success(w);
      const rule = rules.PlayerTrade(new PlayerTradeAction('P1', 'P2', p1.resources, p2.resources));
      const applied = rule(initialResult);
      expect(applied).not.toHaveProperty('reason');
      applied.flatMap((w) => {
        expect(w.players[0].resources === p2.resources);
        expect(w.players[1].resources === p1.resources);
        return success(w);
      });
    });
  
    test('A player trading with another player for will gain the resource traded for', () => {
      const p1: Player = new Player('P1');
      p1.resources = { wood: 1, wool: 0, stone: 0, grain: 0, clay: 0 };

      const p2: Player = new Player('P2');
      p2.resources = { wood: 0, wool: 1, stone: 0, grain: 0, clay: 0 };

      const w: World = {
        currentDie: 2,
        currentPlayer: 0,
        map: [],
        players: [p1, p2],
        winner: undefined,
        pointsToWin: 0,
        gameState: 'Started',
        gameStatistics: new GameStatistics(),
        version: 0,
        conditions: {},
        gameRules: {
          gameType: 'original',
          maxCities: 0,
          maxHouses: 0,
          maxRoads: 0,
          pointsToWin: 0,
          rounds: 0,
        },
      };

      const initialResult = success(w);
      const rule = rules.PlayerTrade(new PlayerTradeAction('P1', 'P2', p1.resources, p2.resources));
      const applied = rule(initialResult);
      expect(applied).not.toHaveProperty('reason');
      applied.flatMap((w) => {
        expect(w.players[0].resources === p2.resources);
        expect(w.players[1].resources === p1.resources);
        return success(w);
      });
    });
  
    test('A player trading 4:1 with the bank with 4 resources of the same type is allowed', () => {
      const p1: Player = new Player('P1');
      p1.resources = { wood: 4, wool: 0, stone: 0, grain: 0, clay: 0 };
      const wantedResources = { wood: 0, wool: 1, stone: 0, grain: 0, clay: 0 };

      const w: World = {
        currentDie: 2,
        currentPlayer: 0,
        map: [],
        players: [p1],
        winner: undefined,
        pointsToWin: 0,
        gameState: 'Started',
        gameStatistics: new GameStatistics(),
        version: 0,
        conditions: {},
        gameRules: {
          gameType: 'original',
          maxCities: 0,
          maxHouses: 0,
          maxRoads: 0,
          pointsToWin: 0,
          rounds: 0,
        },
      };

      const initialResult = success(w);
      const rule = rules.BankTrade(new BankTradeAction('P1', p1.resources, wantedResources));
      const applied = rule(initialResult);
      expect(applied).not.toHaveProperty('reason');
      applied.flatMap((w) => {
        expect(w.players[0].resources === wantedResources);
        return success(w);
      });
    });
  
    test('A player trading 4:1 with the bank with 4 resources of different types is not allowed', () => {
      const p1: Player = new Player('P1');
      p1.resources = { wood: 3, wool: 1, stone: 0, grain: 0, clay: 0 };
      const wantedResources = { wood: 0, wool: 1, stone: 0, grain: 0, clay: 0 };

      const w: World = {
        currentDie: 2,
        currentPlayer: 0,
        map: [],
        players: [p1],
        winner: undefined,
        pointsToWin: 0,
        gameState: 'Started',
        gameStatistics: new GameStatistics(),
        version: 0,
        conditions: {},
        gameRules: {
          gameType: 'original',
          maxCities: 0,
          maxHouses: 0,
          maxRoads: 0,
          pointsToWin: 0,
          rounds: 0,
        },
      };

      const initialResult = success(w);
      const rule = rules.BankTrade(new BankTradeAction('P1', p1.resources, wantedResources));
      const applied = rule(initialResult);
      expect(applied).toHaveProperty('reason');
      applied.flatMap((w) => {
        expect(w.players[0].resources !== wantedResources);
        return success(w);
      });
    });
  
    test('A player trading 4:1 with the bank with 4 resources of the same types loses 4 resources of that type', () => {
      const p1: Player = new Player('P1');
      p1.resources = { wood: 4, wool: 0, stone: 0, grain: 0, clay: 0 };
      const wantedResources = { wood: 0, wool: 1, stone: 0, grain: 0, clay: 0 };

      const w: World = {
        currentDie: 2,
        currentPlayer: 0,
        map: [],
        players: [p1],
        winner: undefined,
        pointsToWin: 0,
        gameState: 'Started',
        gameStatistics: new GameStatistics(),
        version: 0,
        conditions: {},
        gameRules: {
          gameType: 'original',
          maxCities: 0,
          maxHouses: 0,
          maxRoads: 0,
          pointsToWin: 0,
          rounds: 0,
        },
      };

      const initialResult = success(w);
      const rule = rules.BankTrade(new BankTradeAction('P1', p1.resources, wantedResources));
      const applied = rule(initialResult);
      expect(applied).not.toHaveProperty('reason');
      applied.flatMap((w) => {
        expect(w.players[0].resources.wood === 0);
        return success(w);
      });
    });
  
    test('A player trading 4:1 with the bank with 4 resources of the same types gains 1 resources of the chosen type', () => {
      const p1: Player = new Player('P1');
      p1.resources = { wood: 4, wool: 0, stone: 0, grain: 0, clay: 0 };
      const wantedResources = { wood: 0, wool: 1, stone: 0, grain: 0, clay: 0 };

      const w: World = {
        currentDie: 2,
        currentPlayer: 0,
        map: [],
        players: [p1],
        winner: undefined,
        pointsToWin: 0,
        gameState: 'Started',
        gameStatistics: new GameStatistics(),
        version: 0,
        conditions: {},
        gameRules: {
          gameType: 'original',
          maxCities: 0,
          maxHouses: 0,
          maxRoads: 0,
          pointsToWin: 0,
          rounds: 0,
        },
      };

      const initialResult = success(w);
      const rule = rules.BankTrade(new BankTradeAction('P1', p1.resources, wantedResources));
      const applied = rule(initialResult);
      expect(applied).not.toHaveProperty('reason');
      applied.flatMap((w) => {
        expect(w.players[0].resources.wool === 1);
        return success(w);
      });
    });
  });