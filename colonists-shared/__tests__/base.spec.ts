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
} from '../lib/Shared';
import { empty } from '../lib/Resources';

const clayOnlyResource = (amount: number) => {
  return { clay: amount, grain: 0, stone: 0, wood: 0, wool: 0 };
};
const grainOnlyResource = (amount: number) => {
  return { clay: 0, grain: amount, stone: 0, wood: 0, wool: 0 };
};
const stoneOnlyResource = (amount: number) => {
  return { clay: 0, grain: 0, stone: 0, wood: amount, wool: 0 };
};
const woodOnlyResource = (amount: number) => {
  return { clay: 0, grain: 0, stone: 0, wood: amount, wool: 0 };
};
const woolOnlyResource = (amount: number) => {
  return { clay: 0, grain: 0, stone: 0, wood: 0, wool: amount };
};

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
    const res = woolOnlyResource(1);
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
    expect(result instanceof Success);
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
    expect(result instanceof Failure);
  });
});

/*
* Building
*/
describe('Building rules', () => {

  test('Building a house where there are neighboring houses is not allowed', () => {

  });

  test('Building a house where there are no neighboring houses is allowed', () => {

  });

  test('Building a house without a road leading to it is not allowed', () => {

  });

  test('Building a house with a road leading to it is allowed', () => {

  });

  test('Building a house increases points for the player building the house', () => {

  });

  test('Building a city without an existing house is not allowed', () => {

  });

  test('Building a city with an existing house is allowed', () => {

  });

  test('Building a city increases points for the player building the city', () => {

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

  });

  test('Rolling a 7 and moving the thief to a new tile is allowed', () => {

  });

  test('A player gaining a development card (giving +1 knight) increases their number of knights by 1', () => {

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

  test('A player playing a "free roads" card and can then build two roads', () => {

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
