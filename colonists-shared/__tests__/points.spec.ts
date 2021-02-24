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

  test('A player ending their turn increases the resources for all players according to their placed houses', () => {
    const p1: Player = {
      color: 8526636.983690817,
      name: "P1",
      resources: {
          clay: 1,
          grain: 1,
          stone: 1,
          wood: 2,
          wool: 1
      },
      houses: [
          {
              value: 1,
              cost: {
                  wood: 1,
                  clay: 1,
                  wool: 1,
                  grain: 1,
                  stone: 0
              },
              position: {
                  x: 3,
                  y: -1
              }
          },
          {
              value: 1,
              cost: {
                  wood: 1,
                  clay: 1,
                  wool: 1,
                  grain: 1,
                  stone: 0
              },
              position: {
                  x: 2,
                  y: 2
              }
          }
      ],
      cities: [],
      roads: [
          {
              cost: {
                  wood: 1,
                  clay: 1,
                  wool: 0,
                  stone: 0,
                  grain: 0
              },
              start: {
                  x: 4,
                  y: -1
              },
              end: {
                  x: 3,
                  y: -1
              }
          },
          {
              cost: {
                  wood: 1,
                  clay: 1,
                  wool: 0,
                  stone: 0,
                  grain: 0
              },
              start: {
                  x: 3,
                  y: 3
              },
              end: {
                  x: 2,
                  y: 2
              }
          }
      ],
      ships: [],
      devCards: [],
      points: 2,
      knights: 0
  };
    
    const w: World = 
    {
      winner: undefined,
      currentDie: "None",
      currentPlayer: 0,
      gameRules: {
          gameType: "original",
          rounds: -1,
          pointsToWin: 10,
          maxRoads: 15,
          maxHouses: 10,
          maxCities: 6
      },
      players: [
        p1
      ],
      gameState: "Started",
      map: [
          {
              coord: {
                  x: -2,
                  y: -2
              },
              diceRoll: 6,
              type: "StoneHarbor"
          },
          {
              coord: {
                  x: -3,
                  y: -1
              },
              diceRoll: 6,
              type: "GrainHarbor"
          },
          {
              coord: {
                  x: -3,
                  y: -2
              },
              diceRoll: 6,
              type: "Ocean"
          },
          {
              coord: {
                  x: -2,
                  y: -1
              },
              diceRoll: 6,
              type: "Stone"
          },
          {
              coord: {
                  x: -3,
                  y: 0
              },
              diceRoll: 6,
              type: "Ocean"
          },
          {
              coord: {
                  x: -3,
                  y: -1
              },
              diceRoll: 6,
              type: "StoneHarbor"
          },
          {
              coord: {
                  x: -2,
                  y: 0
              },
              diceRoll: 6,
              type: "Grain"
          },
          {
              coord: {
                  x: -2,
                  y: 2
              },
              diceRoll: 6,
              type: "WoolHarbor"
          },
          {
              coord: {
                  x: -3,
                  y: 1
              },
              diceRoll: 6,
              type: "Ocean"
          },
          {
              coord: {
                  x: -3,
                  y: 0
              },
              diceRoll: 6,
              type: "Ocean"
          },
          {
              coord: {
                  x: -2,
                  y: 1
              },
              diceRoll: 6,
              type: "Wood"
          },
          {
              coord: {
                  x: -1,
                  y: -3
              },
              diceRoll: 6,
              type: "Ocean"
          },
          {
              coord: {
                  x: -2,
                  y: -2
              },
              diceRoll: 6,
              type: "ClayHarbor"
          },
          {
              coord: {
                  x: -1,
                  y: -2
              },
              diceRoll: 6,
              type: "Stone"
          },
          {
              coord: {
                  x: -1,
                  y: -1
              },
              diceRoll: 6,
              type: "Grain"
          },
          {
              coord: {
                  x: -1,
                  y: 0
              },
              diceRoll: 6,
              type: "Stone"
          },
          {
              coord: {
                  x: -1,
                  y: 2
              },
              diceRoll: 6,
              type: "Ocean"
          },
          {
              coord: {
                  x: -2,
                  y: 2
              },
              diceRoll: 6,
              type: "WoodHarbor"
          },
          {
              coord: {
                  x: -1,
                  y: 1
              },
              diceRoll: 6,
              type: "Grain"
          },
          {
              coord: {
                  x: 0,
                  y: -3
              },
              diceRoll: 6,
              type: "ThreeToOneHarbor"
          },
          {
              coord: {
                  x: -1,
                  y: -3
              },
              diceRoll: 6,
              type: "Ocean"
          },
          {
              coord: {
                  x: 1,
                  y: -3
              },
              diceRoll: 6,
              type: "Ocean"
          },
          {
              coord: {
                  x: 0,
                  y: -2
              },
              diceRoll: 6,
              type: "Wood"
          },
          {
              coord: {
                  x: 0,
                  y: -1
              },
              diceRoll: 6,
              type: "Wool"
          },
          {
              coord: {
                  x: 0,
                  y: 0
              },
              diceRoll: 6,
              type: "Stone"
          },
          {
              coord: {
                  x: 0,
                  y: 1
              },
              diceRoll: 6,
              type: "Clay"
          },
          {
              coord: {
                  x: 0,
                  y: 3
              },
              diceRoll: 6,
              type: "ThreeToOneHarbor"
          },
          {
              coord: {
                  x: -1,
                  y: 2
              },
              diceRoll: 6,
              type: "Ocean"
          },
          {
              coord: {
                  x: 1,
                  y: 2
              },
              diceRoll: 6,
              type: "Ocean"
          },
          {
              coord: {
                  x: 0,
                  y: 2
              },
              diceRoll: 6,
              type: "Wool"
          },
          {
              coord: {
                  x: 1,
                  y: -3
              },
              diceRoll: 6,
              type: "Ocean"
          },
          {
              coord: {
                  x: 2,
                  y: -2
              },
              diceRoll: 6,
              type: "StoneHarbor"
          },
          {
              coord: {
                  x: 1,
                  y: -2
              },
              diceRoll: 6,
              type: "Wood"
          },
          {
              coord: {
                  x: 1,
                  y: -1
              },
              diceRoll: 6,
              type: "Wood"
          },
          {
              coord: {
                  x: 1,
                  y: 0
              },
              diceRoll: 6,
              type: "Grain"
          },
          {
              coord: {
                  x: 1,
                  y: 2
              },
              diceRoll: 6,
              type: "Ocean"
          },
          {
              coord: {
                  x: 2,
                  y: 2
              },
              diceRoll: 6,
              type: "GrainHarbor"
          },
          {
              coord: {
                  x: 1,
                  y: 1
              },
              diceRoll: 6,
              type: "Clay"
          },
          {
              coord: {
                  x: 2,
                  y: -2
              },
              diceRoll: 6,
              type: "ClayHarbor"
          },
          {
              coord: {
                  x: 3,
                  y: -1
              },
              diceRoll: 6,
              type: "GrainHarbor"
          },
          {
              coord: {
                  x: 3,
                  y: -2
              },
              diceRoll: 6,
              type: "Ocean"
          },
          {
              coord: {
                  x: 2,
                  y: -1
              },
              diceRoll: 6,
              type: "Stone"
          },
          {
              coord: {
                  x: 3,
                  y: 0
              },
              diceRoll: 6,
              type: "Ocean"
          },
          {
              coord: {
                  x: 3,
                  y: -1
              },
              diceRoll: 6,
              type: "GrainHarbor"
          },
          {
              coord: {
                  x: 2,
                  y: 0
              },
              diceRoll: 6,
              type: "Grain"
          },
          {
              coord: {
                  x: 2,
                  y: 2
              },
              diceRoll: 6,
              type: "ThreeToOneHarbor"
          },
          {
              coord: {
                  x: 3,
                  y: 1
              },
              diceRoll: 6,
              type: "Ocean"
          },
          {
              coord: {
                  x: 3,
                  y: 0
              },
              diceRoll: 6,
              type: "Ocean"
          },
          {
              coord: {
                  x: 2,
                  y: 1
              },
              diceRoll: 6,
              type: "Wool"
          }
      ],
      pointsToWin: 10,
      gameStatistics: {
          turns: 2
      },
      thief: undefined,
      version: 8,
      conditions: {}
    }

    const initialResult = success(w);
    let rule = rules.EndTurn(new EndTurnAction('P1'));

    //Dealing with randomness is unfortunate...
    let toTest: Result = initialResult;
    let stop = false;
    while(!stop) {
      const intermediate = rule(initialResult);
      if (intermediate.hasOwnProperty('value')) {
        stop = (intermediate as Success).value.currentDie === 6;
        toTest = intermediate
      }
    }

    toTest.flatMap((w) => {
      expect(w.players.every((p) => 
        p.resources.wood === p1.resources.wood + 2 
        && p.resources.wood === p1.resources.wool + 1
        && p.resources.stone === p1.resources.stone + 1
        && p.resources.clay === p1.resources.clay + 1
        && p.resources.grain === p1.resources.grain + 1
      ));
      return success(w);
    });
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

/*
* Longest road
*/
describe('Rules when gaining the longest road', () => {
  test('A player having the longest road increases their points by 2', () => {

  });

  test('A player losing the longest road decreases their points by 2', () => {

  });
});