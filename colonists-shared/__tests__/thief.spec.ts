import { EndTurnAction, MoveThiefAction, StealFromPlayerAction } from "../lib/Action";
import { GameStatistics, Player, success, World, rules } from "../lib/Shared";

/*
* Thief movement
*/
describe('Rules for moving the thief', () => {
    test('Rolling a 7, moving the thief and not stealing from another player is not allowed', () => {
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
        conditions: { rolledASeven: { movedThief: false, stoleFromPlayer: false } },
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
      const moveRule = rules.MoveThief(new MoveThiefAction('P1', {x: 1, y: 1}));
      const endRule = rules.EndTurn(new EndTurnAction('P1'));
      const withThiefApplied = endRule(moveRule(withThiefResult));
  
      expect(withThiefApplied).toHaveProperty('reason');
    });

    test('Rolling a 7, moving the thief and stealing from another player is allowed', () => {
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
        conditions: { rolledASeven: { movedThief: false, stoleFromPlayer: true } },
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
      const moveRule = rules.MoveThief(new MoveThiefAction('P1', {x: 1, y: 1}));
      const stealRule = rules.StealFromPlayer(new StealFromPlayerAction('P1', 'P1'));
      const endRule = rules.EndTurn(new EndTurnAction('P1'));
      const withThiefApplied = endRule(stealRule(moveRule(withThiefResult)));
  
      expect(withThiefApplied).toHaveProperty('value');
    });

    test('Rolling a 7 and moving the thief twice is not allowed', () => {
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
        conditions: { rolledASeven: { movedThief: true, stoleFromPlayer: false } },
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
      const moveRule = rules.MoveThief(new MoveThiefAction('P1', {x: 1, y: 1}));
      const stealRule = rules.StealFromPlayer(new StealFromPlayerAction('P1', 'P1'));
      const endRule = rules.EndTurn(new EndTurnAction('P1'));
      const withThiefApplied = endRule(stealRule(moveRule(stealRule(moveRule(withThiefResult)))));
      expect(withThiefApplied).toHaveProperty('reason');
    });
  });