import {
  World,
  Player,
  Result,
  subtractResources,
  resourcesAreNonNegative,
  purchase,
  GameStatistics,
} from '../lib/Shared';

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
const empty = { clay: 0, grain: 0, stone: 0, wood: 0, wool: 0 };

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
    const wr: Result<World> = { tag: 'Success', value: w };
    const pr: Result<Player> = { tag: 'Success', value: p };
    const result = purchase(res)(pr.value.name)(wr);

    expect(result.tag === 'Success');
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
    const wr: Result<World> = { tag: 'Success', value: w };
    const pr: Result<Player> = { tag: 'Success', value: p };
    const result = purchase(cost)(pr.value.name)(wr);

    expect(result.tag === 'Failure');
  });
});
