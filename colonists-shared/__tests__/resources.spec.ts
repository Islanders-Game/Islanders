import { addResources, empty } from "../lib/Resources";
import { GameStatistics, Player, purchase, resourcesAreNonNegative, subtractResources, World } from "../lib/Shared";

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