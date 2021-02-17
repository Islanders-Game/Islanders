import { GameStatistics, Player, Result, success, World, rules, Success } from '../lib/Shared';
import { } from '../lib/Rules/Helpers';
import { EndTurnAction } from '../lib/Action';

/*
* Ending a turn
*/
describe('Rules for ending a turn', () => {
  test('A player ending their turn passes the turn to the next player', () => {
    const p1: Player = new Player('P1');
    const p2: Player = new Player('P2');
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
    const endTurnRule = rules.EndTurn(new EndTurnAction('P1'));
    const firstApplication = endTurnRule(initialResult);

    firstApplication.flatMap((w) => {
      expect(w.currentPlayer === 1)
      // Avoid rolling a 7 and the implications of that for the next application
      w.currentDie = 2;
      return success(w);
    });

    const secondEndTurnRule = rules.EndTurn(new EndTurnAction('P2'));
    const secondApplication = secondEndTurnRule(firstApplication);

    secondApplication.flatMap((w) => {
      expect(w.currentPlayer === 0)
      return success(w);
    })
  });

  test('A player ending their turn when it is not their turn is not allowed', () => {
    const p1: Player = new Player('P1');
    const p2: Player = new Player('P2');
    const w: World = {
      currentDie: 2,
      currentPlayer: 1,
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
    const rule1 = rules.EndTurn(new EndTurnAction('P1'));
    const applied1 = rule1(initialResult);

    expect(applied1).toHaveProperty('reason');
  });

  test('A player ending their turn increases the resources for all players according to their placed houses', () => {

  });

  test('A player rolling a 7 sets the "has rolled 7" conditions for the game', () => {
    const p1: Player = new Player('P1');
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
    let rule = rules.EndTurn(new EndTurnAction('P1'));

    //Dealing with randomness is unfortunate...
    let toTest: Result = initialResult;
    let stop = false;
    while(!stop) {
      const intermediate = rule(initialResult);
      if (intermediate.hasOwnProperty('value')) {
        stop = (intermediate as Success).value.currentDie === 7;
        toTest = intermediate
      }
    }

    const hasConditions = (toTest as Success)?.value?.conditions?.rolledASeven !== undefined;
    expect(hasConditions);
  });
});

/*
* Longest road
*/
describe('Rules when gaining the longest road', () => {
  test('A player having the longest road increases their points by 2', () => {

  });

  test('A player losing the longest road decreases their points by 2', () => {

  });
});

/*
* Highest number of knights
*/
describe('Rules when gaining the longest road', () => {
  
  test('A player having the highest number of knights increases their points by 2', () => {

  });

  test('A player losing the highest number of knights decreases their points by 2', () => {

  });
});
