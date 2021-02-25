import { HarborTradeAction } from "../lib/Action";
import { GameStatistics, Player, rules, success, World } from "../lib/Shared";

/*
* Harbors
*/
describe('Rules when trading using harbors', () => {
    test('A player trading with a 3:1 harbor with no house on a 3:1 harbor tile is not allowed', () => {
      const p1: Player = new Player('P1');
      p1.resources = { wood: 3, wool: 0, stone: 0, grain: 0, clay: 0 };
      const wantedResources = { wood: 0, wool: 1, stone: 0, grain: 0, clay: 0 };

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
      const rule = rules.HarborTrade(new HarborTradeAction('P1', 'ThreeToOneHarbor', p1.resources, wantedResources));
      const applied = rule(initialResult);
      expect(applied).toHaveProperty('reason');
      applied.flatMap((w) => {
        expect(w.players[0].resources !== wantedResources);
        return success(w);
      });
    });
  
    test('A player trading with a 3:1 harbor with a house on a 3:1 harbor tile is allowed', () => {
  
    });
  
    test('A player trading with a 2:1 harbor with no house on a 2:1 harbor tile is not allowed', () => {
      const p1: Player = new Player('P1');
      p1.resources = { wood: 2, wool: 0, stone: 0, grain: 0, clay: 0 };
      const wantedResources = { wood: 0, wool: 1, stone: 0, grain: 0, clay: 0 };

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
      const rule = rules.HarborTrade(new HarborTradeAction('P1', 'WoodHarbor', p1.resources, wantedResources));
      const applied = rule(initialResult);
      expect(applied).toHaveProperty('reason');
      applied.flatMap((w) => {
        expect(w.players[0].resources !== wantedResources);
        return success(w);
      });
    });
  
    test('A player trading with a 2:1 harbor with a house on a 2:1 harbor tile is allowed', () => {
      const wantedResources = { wood: 0, wool: 1, stone: 0, grain: 0, clay: 0 };

      const w: World = {
        winner: undefined,
        currentDie: "None",
        currentPlayer: 0,
        gameRules: {
            gameType: "original",
            rounds: 2,
            pointsToWin: 10,
            maxRoads: 15,
            maxHouses: 10,
            maxCities: 6
        },
        players: [
          {
            color: 5557599.410233193,
            name: "P1",
            resources: {
                clay: 0,
                grain: 0,
                stone: 2,
                wood: 0,
                wool: 0
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
                        x: 6,
                        y: 0
                    }
                }
            ],
            cities: [],
            roads: [],
            ships: [],
            devCards: [],
            points: 1,
            knights: 0
          },
        ],
        gameState: "Started",
        map: [
            {
                coord: {
                    x: -2,
                    y: -2
                },
                diceRoll: "None",
                type: "WoodHarbor"
            },
            {
                coord: {
                    x: -3,
                    y: -1
                },
                diceRoll: "None",
                type: "ThreeToOneHarbor"
            },
            {
                coord: {
                    x: -3,
                    y: -2
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: -2,
                    y: -1
                },
                diceRoll: 8,
                type: "Grain"
            },
            {
                coord: {
                    x: -3,
                    y: 0
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: -3,
                    y: -1
                },
                diceRoll: "None",
                type: "WoolHarbor"
            },
            {
                coord: {
                    x: -2,
                    y: 0
                },
                diceRoll: 8,
                type: "Wool"
            },
            {
                coord: {
                    x: -2,
                    y: 2
                },
                diceRoll: "None",
                type: "GrainHarbor"
            },
            {
                coord: {
                    x: -3,
                    y: 1
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: -3,
                    y: 0
                },
                diceRoll: "None",
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
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: -2,
                    y: -2
                },
                diceRoll: "None",
                type: "ThreeToOneHarbor"
            },
            {
                coord: {
                    x: -1,
                    y: -2
                },
                diceRoll: 12,
                type: "Stone"
            },
            {
                coord: {
                    x: -1,
                    y: -1
                },
                diceRoll: 5,
                type: "Wood"
            },
            {
                coord: {
                    x: -1,
                    y: 0
                },
                diceRoll: 5,
                type: "Wood"
            },
            {
                coord: {
                    x: -1,
                    y: 2
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: -2,
                    y: 2
                },
                diceRoll: "None",
                type: "StoneHarbor"
            },
            {
                coord: {
                    x: -1,
                    y: 1
                },
                diceRoll: 8,
                type: "Wood"
            },
            {
                coord: {
                    x: 0,
                    y: -3
                },
                diceRoll: "None",
                type: "StoneHarbor"
            },
            {
                coord: {
                    x: -1,
                    y: -3
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: 1,
                    y: -3
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: 0,
                    y: -2
                },
                diceRoll: 4,
                type: "Stone"
            },
            {
                coord: {
                    x: 0,
                    y: -1
                },
                diceRoll: 8,
                type: "Stone"
            },
            {
                coord: {
                    x: 0,
                    y: 0
                },
                diceRoll: 10,
                type: "Wood"
            },
            {
                coord: {
                    x: 0,
                    y: 1
                },
                diceRoll: 6,
                type: "Wool"
            },
            {
                coord: {
                    x: 0,
                    y: 3
                },
                diceRoll: "None",
                type: "StoneHarbor"
            },
            {
                coord: {
                    x: -1,
                    y: 2
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: 1,
                    y: 2
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: 0,
                    y: 2
                },
                diceRoll: 4,
                type: "Grain"
            },
            {
                coord: {
                    x: 1,
                    y: -3
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: 2,
                    y: -2
                },
                diceRoll: "None",
                type: "ThreeToOneHarbor"
            },
            {
                coord: {
                    x: 1,
                    y: -2
                },
                diceRoll: 9,
                type: "Wood"
            },
            {
                coord: {
                    x: 1,
                    y: -1
                },
                diceRoll: 3,
                type: "Stone"
            },
            {
                coord: {
                    x: 1,
                    y: 0
                },
                diceRoll: 4,
                type: "Wood"
            },
            {
                coord: {
                    x: 1,
                    y: 2
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: 2,
                    y: 2
                },
                diceRoll: "None",
                type: "WoolHarbor"
            },
            {
                coord: {
                    x: 1,
                    y: 1
                },
                diceRoll: 2,
                type: "Stone"
            },
            {
                coord: {
                    x: 2,
                    y: -2
                },
                diceRoll: "None",
                type: "ThreeToOneHarbor"
            },
            {
                coord: {
                    x: 3,
                    y: -1
                },
                diceRoll: "None",
                type: "ThreeToOneHarbor"
            },
            {
                coord: {
                    x: 3,
                    y: -2
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: 2,
                    y: -1
                },
                diceRoll: 10,
                type: "Stone"
            },
            {
                coord: {
                    x: 3,
                    y: 0
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: 3,
                    y: -1
                },
                diceRoll: "None",
                type: "StoneHarbor"
            },
            {
                coord: {
                    x: 2,
                    y: 0
                },
                diceRoll: 4,
                type: "Wool"
            },
            {
                coord: {
                    x: 2,
                    y: 2
                },
                diceRoll: "None",
                type: "ThreeToOneHarbor"
            },
            {
                coord: {
                    x: 3,
                    y: 1
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: 3,
                    y: 0
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: 2,
                    y: 1
                },
                diceRoll: 4,
                type: "Wood"
            }
        ],
        pointsToWin: 10,
        gameStatistics: {
            turns: 0
        },
        thief: undefined,
        version: 3,
        conditions: { }
      };

      const initialResult = success(w);
      const rule = rules.HarborTrade(new HarborTradeAction('P1', 'StoneHarbor', w.players[0].resources, wantedResources));
      const applied = rule(initialResult);
      expect(applied).not.toHaveProperty('reason');
      applied.flatMap((w) => {
        expect(w.players[0].resources === wantedResources);
        return success(w);
      });
    });
  
    test('A player trading with a 2:1 harbor on a harbor with a different resource type is not allowed', () => {
      const p1: Player = new Player('P1');
      p1.resources = { wood: 2, wool: 0, stone: 0, grain: 0, clay: 0 };
      const wantedResources = { wood: 0, wool: 1, stone: 0, grain: 0, clay: 0 };

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
      const rule = rules.HarborTrade(new HarborTradeAction('P1', 'WoolHarbor', p1.resources, wantedResources));
      const applied = rule(initialResult);
      expect(applied).toHaveProperty('reason');
      applied.flatMap((w) => {
        expect(w.players[0].resources !== wantedResources);
        return success(w);
      });
    });
  
    test('A player trading with a 2:1 harbor on a harbor with the corresponding resource type decreases the amount of the given resource by 2', () => {
      const wantedResources = { wood: 0, wool: 1, stone: 0, grain: 0, clay: 0 };

      const w: World = {
        winner: undefined,
        currentDie: "None",
        currentPlayer: 0,
        gameRules: {
            gameType: "original",
            rounds: 2,
            pointsToWin: 10,
            maxRoads: 15,
            maxHouses: 10,
            maxCities: 6
        },
        players: [
          {
            color: 5557599.410233193,
            name: "P1",
            resources: {
                clay: 0,
                grain: 0,
                stone: 2,
                wood: 0,
                wool: 0
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
                        x: 6,
                        y: 0
                    }
                }
            ],
            cities: [],
            roads: [],
            ships: [],
            devCards: [],
            points: 1,
            knights: 0
          },
        ],
        gameState: "Started",
        map: [
            {
                coord: {
                    x: -2,
                    y: -2
                },
                diceRoll: "None",
                type: "WoodHarbor"
            },
            {
                coord: {
                    x: -3,
                    y: -1
                },
                diceRoll: "None",
                type: "ThreeToOneHarbor"
            },
            {
                coord: {
                    x: -3,
                    y: -2
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: -2,
                    y: -1
                },
                diceRoll: 8,
                type: "Grain"
            },
            {
                coord: {
                    x: -3,
                    y: 0
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: -3,
                    y: -1
                },
                diceRoll: "None",
                type: "WoolHarbor"
            },
            {
                coord: {
                    x: -2,
                    y: 0
                },
                diceRoll: 8,
                type: "Wool"
            },
            {
                coord: {
                    x: -2,
                    y: 2
                },
                diceRoll: "None",
                type: "GrainHarbor"
            },
            {
                coord: {
                    x: -3,
                    y: 1
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: -3,
                    y: 0
                },
                diceRoll: "None",
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
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: -2,
                    y: -2
                },
                diceRoll: "None",
                type: "ThreeToOneHarbor"
            },
            {
                coord: {
                    x: -1,
                    y: -2
                },
                diceRoll: 12,
                type: "Stone"
            },
            {
                coord: {
                    x: -1,
                    y: -1
                },
                diceRoll: 5,
                type: "Wood"
            },
            {
                coord: {
                    x: -1,
                    y: 0
                },
                diceRoll: 5,
                type: "Wood"
            },
            {
                coord: {
                    x: -1,
                    y: 2
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: -2,
                    y: 2
                },
                diceRoll: "None",
                type: "StoneHarbor"
            },
            {
                coord: {
                    x: -1,
                    y: 1
                },
                diceRoll: 8,
                type: "Wood"
            },
            {
                coord: {
                    x: 0,
                    y: -3
                },
                diceRoll: "None",
                type: "StoneHarbor"
            },
            {
                coord: {
                    x: -1,
                    y: -3
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: 1,
                    y: -3
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: 0,
                    y: -2
                },
                diceRoll: 4,
                type: "Stone"
            },
            {
                coord: {
                    x: 0,
                    y: -1
                },
                diceRoll: 8,
                type: "Stone"
            },
            {
                coord: {
                    x: 0,
                    y: 0
                },
                diceRoll: 10,
                type: "Wood"
            },
            {
                coord: {
                    x: 0,
                    y: 1
                },
                diceRoll: 6,
                type: "Wool"
            },
            {
                coord: {
                    x: 0,
                    y: 3
                },
                diceRoll: "None",
                type: "StoneHarbor"
            },
            {
                coord: {
                    x: -1,
                    y: 2
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: 1,
                    y: 2
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: 0,
                    y: 2
                },
                diceRoll: 4,
                type: "Grain"
            },
            {
                coord: {
                    x: 1,
                    y: -3
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: 2,
                    y: -2
                },
                diceRoll: "None",
                type: "ThreeToOneHarbor"
            },
            {
                coord: {
                    x: 1,
                    y: -2
                },
                diceRoll: 9,
                type: "Wood"
            },
            {
                coord: {
                    x: 1,
                    y: -1
                },
                diceRoll: 3,
                type: "Stone"
            },
            {
                coord: {
                    x: 1,
                    y: 0
                },
                diceRoll: 4,
                type: "Wood"
            },
            {
                coord: {
                    x: 1,
                    y: 2
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: 2,
                    y: 2
                },
                diceRoll: "None",
                type: "WoolHarbor"
            },
            {
                coord: {
                    x: 1,
                    y: 1
                },
                diceRoll: 2,
                type: "Stone"
            },
            {
                coord: {
                    x: 2,
                    y: -2
                },
                diceRoll: "None",
                type: "ThreeToOneHarbor"
            },
            {
                coord: {
                    x: 3,
                    y: -1
                },
                diceRoll: "None",
                type: "ThreeToOneHarbor"
            },
            {
                coord: {
                    x: 3,
                    y: -2
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: 2,
                    y: -1
                },
                diceRoll: 10,
                type: "Stone"
            },
            {
                coord: {
                    x: 3,
                    y: 0
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: 3,
                    y: -1
                },
                diceRoll: "None",
                type: "StoneHarbor"
            },
            {
                coord: {
                    x: 2,
                    y: 0
                },
                diceRoll: 4,
                type: "Wool"
            },
            {
                coord: {
                    x: 2,
                    y: 2
                },
                diceRoll: "None",
                type: "ThreeToOneHarbor"
            },
            {
                coord: {
                    x: 3,
                    y: 1
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: 3,
                    y: 0
                },
                diceRoll: "None",
                type: "Ocean"
            },
            {
                coord: {
                    x: 2,
                    y: 1
                },
                diceRoll: 4,
                type: "Wood"
            }
        ],
        pointsToWin: 10,
        gameStatistics: {
            turns: 0
        },
        thief: undefined,
        version: 3,
        conditions: { }
      };

      const initialResult = success(w);
      const rule = rules.HarborTrade(new HarborTradeAction('P1', 'StoneHarbor', w.players[0].resources, wantedResources));
      const applied = rule(initialResult);
      expect(applied).not.toHaveProperty('reason');
      applied.flatMap((w) => {
        expect(w.players[0].resources === wantedResources);
        expect(w.players[0].resources.stone === 0);
        return success(w);
      });
    });
  
    test('A player trading with a 2:1 harbor on a harbor with the corresponding resource type increases the amount of the received resource by 1', () => {
        const w: World = {
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
                {
                    color: 13826743.782846535,
                    name: "P1",
                    resources: {
                        clay: 0,
                        grain: 0,
                        stone: 0,
                        wood: 2,
                        wool: 0
                    },
                    houses: [
                        {
                            "value": 1,
                            "cost": {
                                "wood": 1,
                                "clay": 1,
                                "wool":1,
                                "grain":1,
                                "stone":0
                            },
                            "position": {
                                "x": 6,
                                "y": 0
                            }
                        }
                    ],
                    cities: [],
                    roads: [],
                    ships: [],
                    devCards: [],
                    points: 1,
                    knights: 0
                }
            ],
            gameState: "Started",
            map: 
            [
                {
                    "coord": {
                        "x": -2,
                        "y": -2
                    },
                    "diceRoll": "None",
                    "type": "ThreeToOneHarbor"
                },
                {
                    "coord": {
                        "x": -3,
                        "y": -1
                    },
                    "diceRoll": "None",
                    "type": "ClayHarbor"
                },
                {
                    "coord": {
                        "x": -3,
                        "y": -2
                    },
                    "diceRoll": "None",
                    "type": "Ocean"
                },
                {
                    "coord": {
                        "x": -2,
                        "y": -1
                    },
                    "diceRoll": 10,
                    "type": "Wool"
                },
                {
                    "coord": {
                        "x": -3,
                        "y": 0
                    },
                    "diceRoll": "None",
                    "type": "Ocean"
                },
                {
                    "coord": {
                        "x": -3,
                        "y": -1
                    },
                    "diceRoll": "None",
                    "type": "ThreeToOneHarbor"
                },
                {
                    "coord": {
                        "x": -2,
                        "y": 0
                    },
                    "diceRoll": "None",
                    "type": "Desert"
                },
                {
                    "coord": {
                        "x": -2,
                        "y": 2
                    },
                    "diceRoll": "None",
                    "type": "ThreeToOneHarbor"
                },
                {
                    "coord": {
                        "x": -3,
                        "y": 1
                    },
                    "diceRoll": "None",
                    "type": "Ocean"
                },
                {
                    "coord": {
                        "x": -3,
                        "y": 0
                    },
                    "diceRoll": "None",
                    "type": "Ocean"
                },
                {
                    "coord": {
                        "x": -2,
                        "y": 1
                    },
                    "diceRoll": 9,
                    "type": "Wool"
                },
                {
                    "coord": {
                        "x": -1,
                        "y": -3
                    },
                    "diceRoll": "None",
                    "type": "Ocean"
                },
                {
                    "coord": {
                        "x": -2,
                        "y": -2
                    },
                    "diceRoll": "None",
                    "type": "ClayHarbor"
                },
                {
                    "coord": {
                        "x": -1,
                        "y": -2
                    },
                    "diceRoll": 5,
                    "type": "Stone"
                },
                {
                    "coord": {
                        "x": -1,
                        "y": -1
                    },
                    "diceRoll": 6,
                    "type": "Wool"
                },
                {
                    "coord": {
                        "x": -1,
                        "y": 0
                    },
                    "diceRoll": 8,
                    "type": "Wool"
                },
                {
                    "coord": {
                        "x": -1,
                        "y": 2
                    },
                    "diceRoll": "None",
                    "type": "Ocean"
                },
                {
                    "coord": {
                        "x": -2,
                        "y": 2
                    },
                    "diceRoll": "None",
                    "type": "WoodHarbor"
                },
                {
                    "coord": {
                        "x": -1,
                        "y": 1
                    },
                    "diceRoll": 3,
                    "type": "Wool"
                },
                {
                    "coord": {
                        "x": 0,
                        "y": -3
                    },
                    "diceRoll": "None",
                    "type": "ThreeToOneHarbor"
                },
                {
                    "coord": {
                        "x": -1,
                        "y": -3
                    },
                    "diceRoll": "None",
                    "type": "Ocean"
                },
                {
                    "coord": {
                        "x": 1,
                        "y": -3
                    },
                    "diceRoll": "None",
                    "type": "Ocean"
                },
                {
                    "coord": {
                        "x": 0,
                        "y": -2
                    },
                    "diceRoll": "None",
                    "type": "Desert"
                },
                {
                    "coord": {
                        "x": 0,
                        "y": -1
                    },
                    "diceRoll": 10,
                    "type": "Grain"
                },
                {
                    "coord": {
                        "x": 0,
                        "y": 0
                    },
                    "diceRoll": 10,
                    "type": "Grain"
                },
                {
                    "coord": {
                        "x": 0,
                        "y": 1
                    },
                    "diceRoll": 6,
                    "type": "Wood"
                },
                {
                    "coord": {
                        "x": 0,
                        "y": 3
                    },
                    "diceRoll": "None",
                    "type": "StoneHarbor"
                },
                {
                    "coord": {
                        "x": -1,
                        "y": 2
                    },
                    "diceRoll": "None",
                    "type": "Ocean"
                },
                {
                    "coord": {
                        "x": 1,
                        "y": 2
                    },
                    "diceRoll": "None",
                    "type": "Ocean"
                },
                {
                    "coord": {
                        "x": 0,
                        "y": 2
                    },
                    "diceRoll": 6,
                    "type": "Clay"
                },
                {
                    "coord": {
                        "x": 1,
                        "y": -3
                    },
                    "diceRoll": "None",
                    "type": "Ocean"
                },
                {
                    "coord": {
                        "x": 2,
                        "y": -2
                    },
                    "diceRoll": "None",
                    "type": "GrainHarbor"
                },
                {
                    "coord": {
                        "x": 1,
                        "y": -2
                    },
                    "diceRoll": 5,
                    "type": "Grain"
                },
                {
                    "coord": {
                        "x": 1,
                        "y": -1
                    },
                    "diceRoll": 4,
                    "type": "Grain"
                },
                {
                    "coord": {
                        "x": 1,
                        "y": 0
                    },
                    "diceRoll": 11,
                    "type": "Wood"
                },
                {
                    "coord": {
                        "x": 1,
                        "y": 2
                    },
                    "diceRoll": "None",
                    "type": "Ocean"
                },
                {
                    "coord": {
                        "x": 2,
                        "y": 2
                    },
                    "diceRoll": "None",
                    "type": "WoolHarbor"
                },
                {
                    "coord": {
                        "x": 1,
                        "y": 1
                    },
                    "diceRoll": 8,
                    "type": "Grain"
                },
                {
                    "coord": {
                        "x": 2,
                        "y": -2
                    },
                    "diceRoll": "None",
                    "type": "ThreeToOneHarbor"
                },
                {
                    "coord": {
                        "x": 3,
                        "y": -1
                    },
                    "diceRoll": "None",
                    "type": "ThreeToOneHarbor"
                },
                {
                    "coord": {
                        "x": 3,
                        "y": -2
                    },
                    "diceRoll": "None",
                    "type": "Ocean"
                },
                {
                    "coord": {
                        "x": 2,
                        "y": -1
                    },
                    "diceRoll": 3,
                    "type": "Grain"
                },
                {
                    "coord": {
                        "x": 3,
                        "y": 0
                    },
                    "diceRoll": "None",
                    "type": "Ocean"
                },
                {
                    "coord": {
                        "x": 3,
                        "y": -1
                    },
                    "diceRoll": "None",
                    "type": "WoodHarbor"
                },
                {
                    "coord": {
                        "x": 2,
                        "y": 0
                    },
                    "diceRoll": 6,
                    "type": "Clay"
                },
                {
                    "coord": {
                        "x": 2,
                        "y": 2
                    },
                    "diceRoll": "None",
                    "type": "ThreeToOneHarbor"
                },
                {
                    "coord": {
                        "x": 3,
                        "y": 1
                    },
                    "diceRoll": "None",
                    "type": "Ocean"
                },
                {
                    "coord": {
                        "x": 3,
                        "y": 0
                    },
                    "diceRoll": "None",
                    "type": "Ocean"
                },
                {
                    "coord": {
                        "x": 2,
                        "y": 1
                    },
                    "diceRoll": 10,
                    "type": "Stone"
                }
            ],
            pointsToWin: 10,
            gameStatistics: {
                turns: 0
            },
            thief: undefined,
            version: 3,
            conditions: {
                mustPlaceInitialHouse: {
                    hasPlaced: true
                },
                mustPlaceInitialRoad: {
                    hasPlaced: false
                }
            }
        };
    
        const wantedResources = { wood: 0, wool: 1, stone: 0, grain: 0, clay: 0 };
    
        const initialResult = success(w);
          const rule = rules.HarborTrade(new HarborTradeAction('P1', 'WoodHarbor', w.players[0].resources, wantedResources));
          const applied = rule(initialResult);
          expect(applied).not.toHaveProperty('reason');
          applied.flatMap((w) => {
            expect(w.players[0].resources === wantedResources);
            expect(w.players[0].resources.wool === 1);
            return success(w);
          });
        });
  
    test('A player trading with a 3:1 harbor on a harbor increases the amount of the received resource by 1', () => {
      const w: World = {
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
              {
                  color: 13826743.782846535,
                  name: "P1",
                  resources: {
                      clay: 3,
                      grain: 0,
                      stone: 0,
                      wood: 0,
                      wool: 0
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
                          position: { x: 5, y: -2 }
                      }
                  ],
                  cities: [],
                  roads: [],
                  ships: [],
                  devCards: [],
                  points: 1,
                  knights: 0
              }
          ],
          gameState: "Started",
          map: [{"coord":{"x":-2,"y":-2},"diceRoll":"None","type":"ThreeToOneHarbor"},{"coord":{"x":-3,"y":-1},"diceRoll":"None","type":"ClayHarbor"},{"coord":{"x":-3,"y":-2},"diceRoll":"None","type":"Ocean"},{"coord":{"x":-2,"y":-1},"diceRoll":10,"type":"Wool"},{"coord":{"x":-3,"y":0},"diceRoll":"None","type":"Ocean"},{"coord":{"x":-3,"y":-1},"diceRoll":"None","type":"ThreeToOneHarbor"},{"coord":{"x":-2,"y":0},"diceRoll":"None","type":"Desert"},{"coord":{"x":-2,"y":2},"diceRoll":"None","type":"ThreeToOneHarbor"},{"coord":{"x":-3,"y":1},"diceRoll":"None","type":"Ocean"},{"coord":{"x":-3,"y":0},"diceRoll":"None","type":"Ocean"},{"coord":{"x":-2,"y":1},"diceRoll":9,"type":"Wool"},{"coord":{"x":-1,"y":-3},"diceRoll":"None","type":"Ocean"},{"coord":{"x":-2,"y":-2},"diceRoll":"None","type":"ClayHarbor"},{"coord":{"x":-1,"y":-2},"diceRoll":5,"type":"Stone"},{"coord":{"x":-1,"y":-1},"diceRoll":6,"type":"Wool"},{"coord":{"x":-1,"y":0},"diceRoll":8,"type":"Wool"},{"coord":{"x":-1,"y":2},"diceRoll":"None","type":"Ocean"},{"coord":{"x":-2,"y":2},"diceRoll":"None","type":"WoodHarbor"},{"coord":{"x":-1,"y":1},"diceRoll":3,"type":"Wool"},{"coord":{"x":0,"y":-3},"diceRoll":"None","type":"ThreeToOneHarbor"},{"coord":{"x":-1,"y":-3},"diceRoll":"None","type":"Ocean"},{"coord":{"x":1,"y":-3},"diceRoll":"None","type":"Ocean"},{"coord":{"x":0,"y":-2},"diceRoll":"None","type":"Desert"},{"coord":{"x":0,"y":-1},"diceRoll":10,"type":"Grain"},{"coord":{"x":0,"y":0},"diceRoll":10,"type":"Grain"},{"coord":{"x":0,"y":1},"diceRoll":6,"type":"Wood"},{"coord":{"x":0,"y":3},"diceRoll":"None","type":"StoneHarbor"},{"coord":{"x":-1,"y":2},"diceRoll":"None","type":"Ocean"},{"coord":{"x":1,"y":2},"diceRoll":"None","type":"Ocean"},{"coord":{"x":0,"y":2},"diceRoll":6,"type":"Clay"},{"coord":{"x":1,"y":-3},"diceRoll":"None","type":"Ocean"},{"coord":{"x":2,"y":-2},"diceRoll":"None","type":"GrainHarbor"},{"coord":{"x":1,"y":-2},"diceRoll":5,"type":"Grain"},{"coord":{"x":1,"y":-1},"diceRoll":4,"type":"Grain"},{"coord":{"x":1,"y":0},"diceRoll":11,"type":"Wood"},{"coord":{"x":1,"y":2},"diceRoll":"None","type":"Ocean"},{"coord":{"x":2,"y":2},"diceRoll":"None","type":"WoolHarbor"},{"coord":{"x":1,"y":1},"diceRoll":8,"type":"Grain"},{"coord":{"x":2,"y":-2},"diceRoll":"None","type":"ThreeToOneHarbor"},{"coord":{"x":3,"y":-1},"diceRoll":"None","type":"ThreeToOneHarbor"},{"coord":{"x":3,"y":-2},"diceRoll":"None","type":"Ocean"},{"coord":{"x":2,"y":-1},"diceRoll":3,"type":"Grain"},{"coord":{"x":3,"y":0},"diceRoll":"None","type":"Ocean"},{"coord":{"x":3,"y":-1},"diceRoll":"None","type":"WoodHarbor"},{"coord":{"x":2,"y":0},"diceRoll":6,"type":"Clay"},{"coord":{"x":2,"y":2},"diceRoll":"None","type":"ThreeToOneHarbor"},{"coord":{"x":3,"y":1},"diceRoll":"None","type":"Ocean"},{"coord":{"x":3,"y":0},"diceRoll":"None","type":"Ocean"},{"coord":{"x":2,"y":1},"diceRoll":10,"type":"Stone"}],
          pointsToWin: 10,
          gameStatistics: {
              turns: 2
          },
          thief: undefined,
          version: 3,
          conditions: { }
      };

      const wantedResources = { wood: 0, wool: 1, stone: 0, grain: 0, clay: 0 };

      const initialResult = success(w);
      const rule = rules.HarborTrade(new HarborTradeAction('P1', 'ThreeToOneHarbor', w.players[0].resources, wantedResources));
      const applied = rule(initialResult);
      expect(applied).not.toHaveProperty('reason');
      applied.flatMap((w) => {
      expect(w.players[0].resources === wantedResources);
      expect(w.players[0].resources.wool === 1);
      return success(w);
    });
  });
});
