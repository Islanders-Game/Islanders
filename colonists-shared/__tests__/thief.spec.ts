import { EndTurnAction, MoveThiefAction } from "../lib/Action";
import { GameStatistics, Player, success, World, rules } from "../lib/Shared";

/*
* Thief movement
*/
describe('Rules for moving the thief', () => {
    test('Rolling a 7 and not moving the thief is not allowed', () => {
      const p1: Player = new Player('P1');
  
      const withThief: World = {
        currentDie: 7,
        currentPlayer: 0,
        map: [],
        players: [p1],
        winner: undefined,
        pointsToWin: 0,
        gameState: 'Started',
        thief: {hexCoordinate: {x: 0, y: 0}},
        lastThiefPosition: {hexCoordinate: {x: 0, y: 0}},
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
  
      const withThiefResult = success(withThief);
      const ruleWithThief = rules.EndTurn(new EndTurnAction('P1'));
      const withThiefApplied = ruleWithThief(withThiefResult);
  
      expect(withThiefApplied).toHaveProperty('reason');
    });
  
    test('Rolling a 7 and moving the thief to a new tile is allowed', () => {
      const p1: Player = new Player('P1');
  
      const withThief: World = {
        currentDie: 7,
        currentPlayer: 0,
        map: [],
        players: [p1],
        winner: undefined,
        pointsToWin: 0,
        gameState: 'Started',
        thief: {hexCoordinate: {x: 0, y: 0}},
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
  
      const withoutThief: World = {
        currentDie: 7,
        currentPlayer: 0,
        map: [],
        players: [p1],
        winner: undefined,
        pointsToWin: 0,
        gameState: 'Started',
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
  
      const withThiefResult = success(withThief);
      const withoutThiefResult = success(withoutThief);
      const moveRule = rules.MoveThief(new MoveThiefAction('P1', {x: 1, y: 1}));
      const endRule = rules.EndTurn(new EndTurnAction('P1'));
      const withThiefApplied = endRule(moveRule(withThiefResult));
      const withoutThiefApplied = endRule(moveRule(withoutThiefResult));
  
      expect(withThiefApplied).not.toHaveProperty('reason');
      expect(withoutThiefApplied).not.toHaveProperty('reason');
    });
  });