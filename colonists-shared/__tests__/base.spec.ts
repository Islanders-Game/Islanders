import {
  World,
  Player,
  Result,
  subtractResources,
  resourcesAreNonNegative,
  purchase,
  GameStatistics,
  Failure,
  Success,
  House,
  Road,
  success,
  City,
  rules
} from '../lib/Shared';

import {
  playerHasHarbor,
  placeHouse,
  placeCity,
  moveThief,
  bankTrade
} from '../lib/Rules/Helpers';

import { addResources, empty } from '../lib/Resources';
import { BuyCardAction, EndTurnAction, MoveThiefAction } from '../lib/Action';

const clayOnlyResource = (amount: number) => {
  return { clay: amount, grain: 0, stone: 0, wood: 0, wool: 0 };
};
const grainOnlyResource = (amount: number) => {
  return { clay: 0, grain: amount, stone: 0, wood: 0, wool: 0 };
};
const stoneOnlyResource = (amount: number) => {
  return { clay: 0, grain: 0, stone: amount, wood: 0, wool: 0 };
};
const woodOnlyResource = (amount: number) => {
  return { clay: 0, grain: 0, stone: 0, wood: amount, wool: 0 };
};
const woolOnlyResource = (amount: number) => {
  return { clay: 0, grain: 0, stone: 0, wood: 0, wool: amount };
};

const map = [{"coord":{"x":-2,"y":-2},"diceRoll":"None","type":"ThreeToOneHarbor"},{"coord":{"x":-3,"y":-1},"diceRoll":"None","type":"ThreeToOneHarbor"},{"coord":{"x":-3,"y":-2},"diceRoll":"None","type":"Ocean"},{"coord":{"x":-2,"y":-1},"diceRoll":12,"type":"Stone"},{"coord":{"x":-3,"y":0},"diceRoll":"None","type":"Ocean"},{"coord":{"x":-3,"y":-1},"diceRoll":"None","type":"GrainHarbor"},{"coord":{"x":-2,"y":0},"diceRoll":8,"type":"Grain"},{"coord":{"x":-2,"y":2},"diceRoll":"None","type":"ThreeToOneHarbor"},{"coord":{"x":-3,"y":1},"diceRoll":"None","type":"Ocean"},{"coord":{"x":-3,"y":0},"diceRoll":"None","type":"Ocean"},{"coord":{"x":-2,"y":1},"diceRoll":5,"type":"Wool"},{"coord":{"x":-1,"y":-3},"diceRoll":"None","type":"Ocean"},{"coord":{"x":-2,"y":-2},"diceRoll":"None","type":"ThreeToOneHarbor"},{"coord":{"x":-1,"y":-2},"diceRoll":3,"type":"Clay"},{"coord":{"x":-1,"y":-1},"diceRoll":9,"type":"Clay"},{"coord":{"x":-1,"y":0},"diceRoll":6,"type":"Grain"},{"coord":{"x":-1,"y":2},"diceRoll":"None","type":"Ocean"},{"coord":{"x":-2,"y":2},"diceRoll":"None","type":"WoolHarbor"},{"coord":{"x":-1,"y":1},"diceRoll":5,"type":"Grain"},{"coord":{"x":0,"y":-3},"diceRoll":"None","type":"ClayHarbor"},{"coord":{"x":-1,"y":-3},"diceRoll":"None","type":"Ocean"},{"coord":{"x":1,"y":-3},"diceRoll":"None","type":"Ocean"},{"coord":{"x":0,"y":-2},"diceRoll":"None","type":"Desert"},{"coord":{"x":0,"y":-1},"diceRoll":6,"type":"Grain"},{"coord":{"x":0,"y":0},"diceRoll":4,"type":"Grain"},{"coord":{"x":0,"y":1},"diceRoll":4,"type":"Grain"},{"coord":{"x":0,"y":3},"diceRoll":"None","type":"GrainHarbor"},{"coord":{"x":-1,"y":2},"diceRoll":"None","type":"Ocean"},{"coord":{"x":1,"y":2},"diceRoll":"None","type":"Ocean"},{"coord":{"x":0,"y":2},"diceRoll":6,"type":"Wool"},{"coord":{"x":1,"y":-3},"diceRoll":"None","type":"Ocean"},{"coord":{"x":2,"y":-2},"diceRoll":"None","type":"ThreeToOneHarbor"},{"coord":{"x":1,"y":-2},"diceRoll":4,"type":"Grain"},{"coord":{"x":1,"y":-1},"diceRoll":11,"type":"Wood"},{"coord":{"x":1,"y":0},"diceRoll":6,"type":"Wool"},{"coord":{"x":1,"y":2},"diceRoll":"None","type":"Ocean"},{"coord":{"x":2,"y":2},"diceRoll":"None","type":"ThreeToOneHarbor"},{"coord":{"x":1,"y":1},"diceRoll":4,"type":"Grain"},{"coord":{"x":2,"y":-2},"diceRoll":"None","type":"ClayHarbor"},{"coord":{"x":3,"y":-1},"diceRoll":"None","type":"GrainHarbor"},{"coord":{"x":3,"y":-2},"diceRoll":"None","type":"Ocean"},{"coord":{"x":2,"y":-1},"diceRoll":4,"type":"Clay"},{"coord":{"x":3,"y":0},"diceRoll":"None","type":"Ocean"},{"coord":{"x":3,"y":-1},"diceRoll":"None","type":"ThreeToOneHarbor"},{"coord":{"x":2,"y":0},"diceRoll":8,"type":"Stone"},{"coord":{"x":2,"y":2},"diceRoll":"None","type":"ThreeToOneHarbor"},{"coord":{"x":3,"y":1},"diceRoll":"None","type":"Ocean"},{"coord":{"x":3,"y":0},"diceRoll":"None","type":"Ocean"},{"coord":{"x":2,"y":1},"diceRoll":10,"type":"Wool"}]

/*
* Resources
*/
describe('Resource subtraction', () => {
  test('Check that subtract resources can subtract wood', () => {
    const res = woodOnlyResource(5);
    const subRes = woodOnlyResource(3);
    expect(subtractResources(res, subRes)).toEqual(woodOnlyResource(2));
  });
});

describe('Negative resources are detected', () => {
  test('Non-negative resources are detected with any negative resource type', () => {
    const res = [
      woodOnlyResource(Number.NEGATIVE_INFINITY),
      woolOnlyResource(-1),
      stoneOnlyResource(Number.NEGATIVE_INFINITY),
      grainOnlyResource(-2),
      clayOnlyResource(Number.NEGATIVE_INFINITY),
    ];

    res.forEach((r) => expect(resourcesAreNonNegative(r)).toBeFalsy());
  });

  test('Non-negative resources are NOT detected with any positive resource type', () => {
    const res = [
      woodOnlyResource(Number.POSITIVE_INFINITY),
      woolOnlyResource(1),
      stoneOnlyResource(Number.POSITIVE_INFINITY),
      grainOnlyResource(2),
      clayOnlyResource(Number.POSITIVE_INFINITY),
    ];

    res.forEach((r) => expect(resourcesAreNonNegative(r)));
  });
});

describe('Checking for purchaseability', () => {
  test('Player can afford purchase', () => {
    const res = addResources(woolOnlyResource(1), woodOnlyResource(1));
    const p: Player = new Player('P');
    p.resources = res;

    const w: World = {
      currentDie: 'None',
      currentPlayer: 0,
      map: [],
      winner: undefined,
      players: [p],
      gameStatistics: new GameStatistics(),
      gameState: 'Uninitialized',
      pointsToWin: 0,
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


    const result = purchase(res)(p.name)(w);
    expect(result).not.toHaveProperty('reason');
  });

  test('Player can NOT afford purchase', () => {
    const res = empty;
    const cost = woolOnlyResource(1);
    const p = new Player('P');
    p.resources = res;

    const w: World = {
      currentDie: 'None',
      currentPlayer: 0,
      map: [],
      players: [p],
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

    const result = purchase(cost)(p.name)(w);
    expect(result).toHaveProperty('reason');
    
  });
});

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
      expect(w.players.every((p: Player) => p.cities.length === 1 && p.cities.every((c: City) => c.position === {x: 0, y: 0}))); 
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

/*
* Ending a turn
*/
describe('Rules for ending a turn', () => {
  test('A player ending their turn passes the turn to the next player', () => {

  });

  test('A player ending their turn increases the resources for all players according to their placed houses', () => {

  });

  test('A player trading with a 3:1 harbor with a house on a 3:1 harbor is allowed', () => {

  });
});

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

  test('A player gaining a development card (giving +1 knight) increases their number of knights by 1', () => {
    const p1: Player = new Player('P1');
    p1.resources = 
      addResources(grainOnlyResource(Number.POSITIVE_INFINITY), 
        addResources(woolOnlyResource(Number.POSITIVE_INFINITY), 
          stoneOnlyResource(Number.POSITIVE_INFINITY)));

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
    const rule = rules.BuyCard(new BuyCardAction('P1'));
    
    //Dealing with randomness is unfortunate...
    let toTest: Result = initialResult;
    let stop = false;
    while(!stop) {
      const intermediate = rule(initialResult);
      if (intermediate.hasOwnProperty('value')) {
        const shouldStop = (intermediate as Success).value.players.find(p => p.name === p1.name)!.devCards.some(c => c.type === 'Knight');
        if (shouldStop) {
          stop = shouldStop;
          toTest = intermediate;
        }
      }
    }

    expect(toTest).not.toHaveProperty('reason');
    toTest.flatMap((w) => {
      expect(w.players.find(p => p.name === p1.name)!.knights === 1)
      return success(w);
    });
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

/*
* Development cards
*/
describe('Rules when playing development cards', () => {

  test('A player playing a development card they do not have is not allowed', () => {

  });

  test('A player playing a development card they have is allowed', () => {

  });

  test('A player gaining a development card (giving +1 point) increases their points by 1', () => {

  });

  test('A player playing a monopoly card gains all of the chosen resource', () => {

  });

  test('All players lose all of the chosen resource when another player plays a monopoly card', () => {

  });

  test('A player playing a "Road Building" card and can then build two roads', () => {

  });

  test('A player playing a "Year of Plenty" card will then have two resources of the chosen type after choosing', () => {

  });
});

/*
* Harbors
*/
describe('Rules when trading using harbors', () => {

  test('A player trading with a 3:1 harbor with no house on a 3:1 harbor tile is not allowed', () => {

  });

  test('A player trading with a 3:1 harbor with a house on a 3:1 harbor tile is allowed', () => {

  });

  test('A player trading with a 2:1 harbor with no house on a 2:1 harbor tile is not allowed', () => {

  });

  test('A player trading with a 2:1 harbor with a house on a 2:1 harbor tile is allowed', () => {

  });

  test('A player trading with a 2:1 harbor on a harbor with a different resource type is not allowed', () => {

  });

  test('A player trading with a 2:1 harbor on a harbor with the corresponding resource type is allowed', () => {

  });

  test('A player trading with a 2:1 harbor on a harbor with the corresponding resource type decreases the amount of the given resource by 2', () => {

  });

  test('A player trading with a 2:1 harbor on a harbor with the corresponding resource type increases the amount of the received resource by 1', () => {

  });

  test('A player trading with a 3:1 harbor on a harbor increases the amount of the received resource by 1', () => {

  });
});

/* 
* Trading
*/
describe('Rules when trading with other players', () => {

  test('A player trading with another player will lose the resource traded away', () => {

  });

  test('A player trading with another player for will gain the resource traded for', () => {

  });

  test('A player trading 4:1 with the bank with 4 resources of the same type is allowed', () => {

  });

  test('A player trading 4:1 with the bank with 4 resources of different types is not allowed', () => {

  });

  test('A player trading 4:1 with the bank with 4 resources of the same types loses 4 resources of that type', () => {

  });

  test('A player trading 4:1 with the bank with 4 resources of the same types gains 1 resources of the chosen type', () => {

  });
});
