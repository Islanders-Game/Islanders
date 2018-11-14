import {
  World,
  Player,
  Result,
  subtractResources,
  resourcesAreNonNegative,
  purchase,
  GameStatistics,
} from '../lib/Shared';

describe('Resource subtraction', () => {
  test('Check that subtract resources can subtract wood', () => {
    const res = { wood: 5 };
    const subRes = { wood: 3 };
    expect(subtractResources(res, subRes)).toEqual({ wood: 2 });
  });
});

describe('Negative resources are detected', () => {
  test('Non-negative resources are detected with any negative resource type', () => {
    const res = [
      { wood: Number.NEGATIVE_INFINITY },
      { wool: -1 },
      { stone: Number.NEGATIVE_INFINITY },
      { grain: -2 },
      { clay: Number.NEGATIVE_INFINITY },
    ];

    res.forEach((r) => expect(resourcesAreNonNegative(r)).toBeFalsy());
  });

  test('Non-negative resources are NOT detected with any positive resource type', () => {
    const res = [
      { wood: Number.POSITIVE_INFINITY },
      { wool: 1 },
      { stone: Number.POSITIVE_INFINITY },
      { grain: 2 },
      { clay: Number.POSITIVE_INFINITY },
    ];

    res.forEach((r) => expect(resourcesAreNonNegative(r)).toBeFalsy());
  });
});

describe('Checking for purchaseability', () => {
  test('Player can afford purchase', () => {
    const res = { wool: 1 };

    const p: Player = new Player('P');
    p.resources = res;

    const w: World = {
      currentDie: 'None',
      currentPlayer: 0,
      map: [],
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
    const wr: Result<World> = { tag: 'Success', value: w };
    const pr: Result<Player> = { tag: 'Success', value: p };
    const result = purchase(res)(pr.value.name)(wr);

    expect(result.tag === 'Success');
  });

  test('Player can NOT afford purchase', () => {
    const res = { wool: 0 };
    const cost = { wool: 1 };
    const p = new Player('P');
    p.resources = res;

    const w: World = {
      currentDie: 'None',
      currentPlayer: 0,
      map: [],
      players: [p],
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
    const wr: Result<World> = { tag: 'Success', value: w };
    const pr: Result<Player> = { tag: 'Success', value: p };
    const result = purchase(cost)(pr.value.name)(wr);

    expect(result.tag === 'Failure');
  });
});
