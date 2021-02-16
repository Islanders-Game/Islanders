import { placeCity, placeHouse } from "../lib/Rules/Helpers";
import { GameStatistics, House, Player, Road, success, World } from "../lib/Shared";

/*
* Building
*/
describe('Building rules', () => {
  
    test('Building a house without a road leading to it is not allowed', () => {
      const p1: Player = new Player('P1');
  
      const w: World = {
        currentDie: 'None',
        currentPlayer: 0,
        map: [],
        players: [p1],
        winner: undefined,
        pointsToWin: 0,
        gameState: 'Uninitialized',
        gameStatistics: new GameStatistics(),
        version: 0,
        gameRules: {
          gameType: 'original',
          maxCities: 0,
          maxHouses: 0,
          maxRoads: 0,
          pointsToWin: 0,
          rounds: 0,
        },
      };
  
      const resultOnSamePlayer = placeHouse({x: 1, y: 2})('P1')(w);
      expect(resultOnSamePlayer).toHaveProperty('reason');
    });
  
    test('Building a house with a road leading to it is allowed', () => {
      const p1: Player = new Player('P1');
  
      const w: World = {
        currentDie: 'None',
        currentPlayer: 0,
        map: [],
        players: [p1],
        winner: undefined,
        pointsToWin: 0,
        gameState: 'Uninitialized',
        gameStatistics: new GameStatistics(),
        version: 0,
        gameRules: {
          gameType: 'original',
          maxCities: 0,
          maxHouses: 0,
          maxRoads: 0,
          pointsToWin: 0,
          rounds: 0,
        },
      };
  
      p1.roads = [new Road({x: 0, y: 0}, {x: 1, y: 1})]
  
      const resultOnSamePlayer = placeHouse({x: 1, y: 1})('P1')(w);
      expect(resultOnSamePlayer).not.toHaveProperty('reason');
    });
  
    test('Building a house where there are neighboring houses is not allowed', () => {
      const p1: Player = new Player('P1');
      p1.houses = [new House({x: 0, y: 0})];
  
      const p2: Player = new Player('P2');
      p1.houses = [new House({x: 4, y: 4})];
  
      const w: World = {
        currentDie: 'None',
        currentPlayer: 0,
        map: [],
        players: [p1, p2],
        winner: undefined,
        pointsToWin: 0,
        gameState: 'Uninitialized',
        gameStatistics: new GameStatistics(),
        version: 0,
        gameRules: {
          gameType: 'original',
          maxCities: 0,
          maxHouses: 0,
          maxRoads: 0,
          pointsToWin: 0,
          rounds: 0,
        },
      };
      
      const resultOnSamePlayer = placeHouse({x: 1, y: 2})('P1')(w);
      expect(resultOnSamePlayer).toHaveProperty('reason');
  
      const resultOnOtherPlayer = placeHouse({x: 5, y: 5})('P1')(w);
      expect(resultOnOtherPlayer).toHaveProperty('reason');
    });
  
    test('Building a house where there are no neighboring houses is allowed', () => {
      const p1: Player = new Player('P1');
      p1.roads = [new Road({x: 0, y: 0}, {x: 1, y: 1})]
  
      const w: World = {
        currentDie: 'None',
        currentPlayer: 0,
        map: [],
        players: [p1],
        winner: undefined,
        pointsToWin: 0,
        gameState: 'Uninitialized',
        gameStatistics: new GameStatistics(),
        version: 0,
        gameRules: {
          gameType: 'original',
          maxCities: 0,
          maxHouses: 0,
          maxRoads: 0,
          pointsToWin: 0,
          rounds: 0,
        },
      };
      
      const resultOnSamePlayer = placeHouse({x: 1, y: 1})('P1')(w);
      expect(resultOnSamePlayer).not.toHaveProperty('reason');
    });
  
    test('Building a house increases points for the player building the house', () => {
      const p1: Player = new Player('P1');
      p1.roads = [new Road({x: 0, y: 0}, {x: 1, y: 1})]
      p1.points = 0;
  
      const w: World = {
        currentDie: 'None',
        currentPlayer: 0,
        map: [],
        players: [p1],
        winner: undefined,
        pointsToWin: 0,
        gameState: 'Uninitialized',
        gameStatistics: new GameStatistics(),
        version: 0,
        gameRules: {
          gameType: 'original',
          maxCities: 0,
          maxHouses: 0,
          maxRoads: 0,
          pointsToWin: 0,
          rounds: 0,
        },
      };
      
      const resultOnSamePlayer = placeHouse({x: 1, y: 1})('P1')(w);
      expect(resultOnSamePlayer).not.toHaveProperty('reason');
      expect(resultOnSamePlayer.flatMap((w: World) => {
        expect(w.players.some((p: Player) => p.points === 1)); 
        return success(w)
      }));
    });
  
    test('Building a city with an existing house is allowed', () => {
      const p1: Player = new Player('P1');
      p1.houses = [new House({x: 0, y: 0})];
  
      const w: World = {
        currentDie: 'None',
        currentPlayer: 0,
        map: [],
        players: [p1],
        winner: undefined,
        pointsToWin: 0,
        gameState: 'Uninitialized',
        gameStatistics: new GameStatistics(),
        version: 0,
        gameRules: {
          gameType: 'original',
          maxCities: 0,
          maxHouses: 0,
          maxRoads: 0,
          pointsToWin: 0,
          rounds: 0,
        },
      };
      
      const resultOnSamePlayer = placeCity({x: 0, y: 0})('P1')(w);
      expect(resultOnSamePlayer).not.toHaveProperty('reason');
      expect(resultOnSamePlayer.flatMap((w: World) => {
        expect(w.players.every((p: Player) => p.cities.length === 1 && p.cities.every((c => c.position === {x: 0, y: 0})))); 
        return success(w)
      }));
    });
  
    test('Building a city without an existing house is not allowed', () => {
      const p1: Player = new Player('P1');
  
      const w: World = {
        currentDie: 'None',
        currentPlayer: 0,
        map: [],
        players: [p1],
        winner: undefined,
        pointsToWin: 0,
        gameState: 'Uninitialized',
        gameStatistics: new GameStatistics(),
        version: 0,
        gameRules: {
          gameType: 'original',
          maxCities: 0,
          maxHouses: 0,
          maxRoads: 0,
          pointsToWin: 0,
          rounds: 0,
        },
      };
      
      const resultOnSamePlayer = placeCity({x: 0, y: 0})('P1')(w);
      expect(resultOnSamePlayer.flatMap((w: World) => {
        expect(w.players.every((p: Player) => p.cities.length === 0)); 
        return success(w)
      }));
      expect(resultOnSamePlayer).toHaveProperty('reason');
    });
  
    test('Building a city increases points for the player building the city', () => {
      const p1: Player = new Player('P1');
      p1.houses = [new House({x: 0, y: 0})];
  
      const w: World = {
        currentDie: 'None',
        currentPlayer: 0,
        map: [],
        players: [p1],
        winner: undefined,
        pointsToWin: 0,
        gameState: 'Uninitialized',
        gameStatistics: new GameStatistics(),
        version: 0,
        gameRules: {
          gameType: 'original',
          maxCities: 0,
          maxHouses: 0,
          maxRoads: 0,
          pointsToWin: 0,
          rounds: 0,
        },
      };
  
      const resultOnSamePlayer = placeCity({x: 0, y: 0})('P1')(w);
      expect(resultOnSamePlayer.flatMap((w: World) => {
        expect(w.players.every((p: Player) => p.points === 1)); 
        return success(w)
      }));
      expect(resultOnSamePlayer).not.toHaveProperty('reason');
    });
  });