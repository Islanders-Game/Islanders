import { BuildHouseAction, BuildCityAction, BuildRoadAction } from "../lib/Action";
import { GameStatistics, House, Player, Road, success, rules, World } from "../lib/Shared";

/*
* Building
*/
describe('Building rules', () => {
  
    test('Building a house without a road leading to it is not allowed', () => {
      const p1: Player = new Player('P1');
      p1.resources = {wood: 100, stone: 100, wool: 100, grain: 100, clay: 100}

      const w: World = {
        currentDie: 'None',
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
          maxCities: 1000,
          maxHouses: 1000,
          maxRoads: 1000,
          pointsToWin: 1000,
          rounds: 1000,
        },
      };

      const initialResult = success(w);
      const rule = rules.BuildHouse(new BuildHouseAction('P1', {x: 1, y: 2}));
      const applied = rule(initialResult);

      expect(applied).toHaveProperty('reason');
    });
  
    test('Building a house with a road leading to it is allowed', () => {
      const p1: Player = new Player('P1');
      p1.resources = {wood: 100, stone: 100, wool: 100, grain: 100, clay: 100}
  
      const w: World = {
        currentDie: 'None',
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
          maxCities: 1000,
          maxHouses: 1000,
          maxRoads: 1000,
          pointsToWin: 1000,
          rounds: 1000,
        },
      };
  
      p1.roads = [new Road({x: 0, y: 0}, {x: 1, y: 1})]
  
      const initialResult = success(w);
      const rule = rules.BuildHouse(new BuildHouseAction('P1', {x: 1, y: 1}));
      const applied = rule(initialResult);
      
      expect(applied).not.toHaveProperty('reason');
    });
  
    test('Building a house where there are neighboring houses is not allowed', () => {
      const p1: Player = new Player('P1');
      p1.houses = [new House({x: 0, y: 0})];
      p1.resources = {wood: 100, stone: 100, wool: 100, grain: 100, clay: 100}
  
      const p2: Player = new Player('P2');
      p2.houses = [new House({x: 4, y: 4})];
      p2.resources = {wood: 100, stone: 100, wool: 100, grain: 100, clay: 100}
  
      const w: World = {
        currentDie: 'None',
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
          maxCities: 1000,
          maxHouses: 1000,
          maxRoads: 1000,
          pointsToWin: 1000,
          rounds: 1000,
        },
      };
      
      const initialResult = success(w);
      const rule1 = rules.BuildHouse(new BuildHouseAction('P1', {x: 1, y: 2}));
      const applied1 = rule1(initialResult);
      expect(applied1).toHaveProperty('reason');
  
      const rule2 = rules.BuildHouse(new BuildHouseAction('P1', {x: 5, y: 5}));
      const applied2 = rule2(initialResult);
      expect(applied2).toHaveProperty('reason');
    });
  
    test('Building a house where there are no neighboring houses is allowed', () => {
      const p1: Player = new Player('P1');
      p1.roads = [new Road({x: 0, y: 0}, {x: 1, y: 1})]
      p1.resources = {wood: 100, stone: 100, wool: 100, grain: 100, clay: 100}
  
      const w: World = {
        currentDie: 'None',
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
          maxCities: 1000,
          maxHouses: 1000,
          maxRoads: 1000,
          pointsToWin: 1000,
          rounds: 1000,
        },
      };
      
      const initialResult = success(w);
      const rule = rules.BuildHouse(new BuildHouseAction('P1', {x: 1, y: 1}));
      const applied = rule(initialResult);
      expect(applied).not.toHaveProperty('reason');
    });
  
    test('Building a house increases points for the player building the house', () => {
      const p1: Player = new Player('P1');
      p1.roads = [new Road({x: 0, y: 0}, {x: 1, y: 1})]
      p1.points = 0;
      p1.resources = {wood: 100, stone: 100, wool: 100, grain: 100, clay: 100}
  
      const w: World = {
        currentDie: 'None',
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
          maxCities: 1000,
          maxHouses: 1000,
          maxRoads: 1000,
          pointsToWin: 1000,
          rounds: 1000,
        },
      };
      
      const initialResult = success(w);
      const rule = rules.BuildHouse(new BuildHouseAction('P1', {x: 1, y: 1}));
      const applied = rule(initialResult);
      expect(applied).not.toHaveProperty('reason');
      expect(applied.flatMap((w: World) => {
        expect(w.players.some((p: Player) => p.points === 1)); 
        return success(w)
      }));
    });
  
    test('Building a city with an existing house is allowed', () => {
      const p1: Player = new Player('P1');
      p1.houses = [new House({x: 0, y: 0})];
      p1.resources = {wood: 100, stone: 100, wool: 100, grain: 100, clay: 100}
  
      const w: World = {
        currentDie: 'None',
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
          maxCities: 1000,
          maxHouses: 1000,
          maxRoads: 1000,
          pointsToWin: 1000,
          rounds: 1000,
        },
      };
      
      const initialResult = success(w);
      const rule = rules.BuildCity(new BuildCityAction('P1', {x: 0, y: 0}));
      const applied = rule(initialResult);
      expect(applied).not.toHaveProperty('reason');
      expect(applied.flatMap((w: World) => {
        expect(w.players.every((p: Player) => p.cities.length === 1 && p.cities.every((c => c.position === {x: 0, y: 0})))); 
        return success(w)
      }));
    });
  
    test('Building a city without an existing house is not allowed', () => {
      const p1: Player = new Player('P1');
      p1.resources = {wood: 100, stone: 100, wool: 100, grain: 100, clay: 100}
  
      const w: World = {
        currentDie: 'None',
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
          maxCities: 1000,
          maxHouses: 1000,
          maxRoads: 1000,
          pointsToWin: 1000,
          rounds: 1000,
        },
      };
      
      const initialResult = success(w);
      const rule = rules.BuildCity(new BuildCityAction('P1', {x: 0, y: 0}));
      const applied = rule(initialResult);
      
      expect(applied.flatMap((w: World) => {
        expect(w.players.every((p: Player) => p.cities.length === 0)); 
        return success(w)
      }));
      expect(applied).toHaveProperty('reason');
    });
  
    test('Building a city increases points for the player building the city', () => {
      const p1: Player = new Player('P1');
      p1.houses = [new House({x: 0, y: 0})];
      p1.resources = {wood: 100, stone: 100, wool: 100, grain: 100, clay: 100}
  
      const w: World = {
        currentDie: 'None',
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
          maxCities: 1000,
          maxHouses: 1000,
          maxRoads: 1000,
          pointsToWin: 1000,
          rounds: 1000,
        },
      };
  
      const initialResult = success(w);
      const rule = rules.BuildCity(new BuildCityAction('P1', {x: 0, y: 0}));
      const applied = rule(initialResult);
      expect(applied.flatMap((w: World) => {
        expect(w.players.every((p: Player) => p.points === 1)); 
        return success(w)
      }));
      expect(applied).not.toHaveProperty('reason');
    });

    test('Building more cites than the maximum amount set in the rules is not allowed', () => {
      const p1: Player = new Player('P1');
      p1.resources = {wood: 100, stone: 100, wool: 100, grain: 100, clay: 100}
  
      const w: World = {
        currentDie: 'None',
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
          maxHouses: 1000,
          maxRoads: 1000,
          pointsToWin: 1000,
          rounds: 1000,
        },
      };
      
      const initialResult = success(w);
      const rule = rules.BuildCity(new BuildCityAction('P1', {x: 0, y: 0}));
      const applied = rule(initialResult);
      
      expect(applied).toHaveProperty('reason');
    });

    test('Building more roads than the maximum amount set in the rules is not allowed', () => {
      const p1: Player = new Player('P1');
      p1.resources = {wood: 100, stone: 100, wool: 100, grain: 100, clay: 100}
  
      const w: World = {
        currentDie: 'None',
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
          maxCities: 1000,
          maxHouses: 1000,
          maxRoads: 0,
          pointsToWin: 1000,
          rounds: 1000,
        },
      };
      
      const initialResult = success(w);
      const rule = rules.BuildRoad(new BuildRoadAction('P1', {x: 0, y: 0}, {x: 0, y: 1}));
      const applied = rule(initialResult);
      
      expect(applied).toHaveProperty('reason');
    });

    test('Building more houses than the maximum amount set in the rules is not allowed', () => {
      const p1: Player = new Player('P1');
      p1.resources = {wood: 100, stone: 100, wool: 100, grain: 100, clay: 100}
  
      const w: World = {
        currentDie: 'None',
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
          maxCities: 1000,
          maxHouses: 1000,
          maxRoads: 0,
          pointsToWin: 1000,
          rounds: 1000,
        },
      };
      
      const initialResult = success(w);
      const rule = rules.BuildHouse(new BuildHouseAction('P1', {x: 0, y: 0}));
      const applied = rule(initialResult);
      
      expect(applied).toHaveProperty('reason');
    });
  });