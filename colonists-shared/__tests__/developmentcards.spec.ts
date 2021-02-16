/*
* Development cards
*/

import { BuyCardAction, PlayCardAction } from "../lib/Action";
import { DevelopmentCard } from "../lib/Entities/DevelopmentCard";
import { GameStatistics, Player, Resources, success, World, rules, Result, Success } from "../lib/Shared";

describe('Rules when playing development cards', () => {
  
    test('A player gaining a Knight development card (giving +1 knight) increases their number of knights by 1', () => {
      const p1: Player = new Player('P1');
      p1.resources = { grain: Number.POSITIVE_INFINITY, wool: Number.POSITIVE_INFINITY, stone: Number.POSITIVE_INFINITY, clay: 0, wood: 0}
  
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
  
    test('A player playing an already played development card they have is not allowed', () => {
      const p1: Player = new Player('P1');
      const devCard: DevelopmentCard = {cost: {grain: 1, stone: 1, wool: 1, wood: 0, clay: 0}, played: true, type: 'Road Building'} as DevelopmentCard
      p1.devCards = [devCard];
      const w: World = {
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
  
  
      const initial = success(w);
      const rule = rules.PlayCard(new PlayCardAction('P1', devCard));
      const applied = rule(initial);
      expect(applied).toHaveProperty('reason');
    });
  
    test('A player playing a un-played development card they have is allowed', () => {
      const p1: Player = new Player('P1');
      const devCard: DevelopmentCard = {cost: {grain: 1, stone: 1, wool: 1, wood: 0, clay: 0}, played: false, type: 'Road Building'} as DevelopmentCard
      p1.devCards = [devCard];
  
      const w: World = {
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
  
      const initial = success(w);
      const rule = rules.PlayCard(new PlayCardAction('P1', devCard));
      const applied = rule(initial);
      expect(applied).not.toHaveProperty('reason');
      expect(applied).toHaveProperty('value');
    });
  
    test('A player playing a development card they have marks the development card as played', () => {
      const p1: Player = new Player('P1');
      const devCard: DevelopmentCard = {cost: {grain: 1, stone: 1, wool: 1, wood: 0, clay: 0}, played: false, type: 'Road Building'} as DevelopmentCard
      p1.devCards = [devCard];
  
      const w: World = {
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
  
      const initial = success(w);
      const rule = rules.PlayCard(new PlayCardAction('P1', devCard));
      const applied = rule(initial);
      applied.flatMap(w => {
        expect(w.players.every(p => p.devCards.every(c => c.played)));
        return success(w);
      });
    });
  
    test('A player playing a development card they do not have is not allowed', () => {
      const p1: Player = new Player('P1');
      const w: World = {
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
  
      const devCard: DevelopmentCard = {cost: {grain: 1, stone: 1, wool: 1, wood: 0, clay: 0}, played: false, type: 'Road Building'} as DevelopmentCard
  
      const initial = success(w);
      const rule = rules.PlayCard(new PlayCardAction('P1', devCard));
      const applied = rule(initial);
      expect(applied).toHaveProperty('reason');
    });
  
    test('A player playing a Victory Point development card (giving +1 point) increases their points by 1', () => {
      const p1: Player = new Player('P1');
      const devCard: DevelopmentCard = {cost: {grain: 1, stone: 1, wool: 1, wood: 0, clay: 0}, played: false, type: 'Victory Point'} as DevelopmentCard
      p1.devCards = [devCard];
  
      const w: World = {
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
  
      const initial = success(w);
      const rule = rules.PlayCard(new PlayCardAction('P1', devCard));
      const applied = rule(initial);
      applied.flatMap(w => {
        expect(w.players.every(p => p.points === 1));
        return success(w);
      });
    });
  
    test('A player playing a Monopoly card gains all of the chosen resource from other players', () => {
      const resources: Resources = { wool: 0, wood: 0, stone: 0, clay: 0, grain: 0};
      const p1: Player = new Player('P1');
      const devCard: DevelopmentCard = {cost: {grain: 1, stone: 1, wool: 1, wood: 0, clay: 0}, played: false, type: 'Monopoly'} as DevelopmentCard;
      p1.devCards = [devCard];
      p1.resources = resources;
  
      const p2: Player = new Player('P2');
      p2.resources = {...resources, wood: 100};
      const p3: Player = new Player('P2');
      p3.resources = {...resources, wood: 100};
  
      const w: World = {
        currentDie: 7,
        currentPlayer: 0,
        map: [],
        players: [p1, p2],
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
  
      const initial = success(w);
      const rule = rules.PlayCard(new PlayCardAction('P1', devCard, ['Wood']));
      const applied = rule(initial);
      applied.flatMap(w => {
        expect(w.players.find(p => p.name === 'P1')?.resources.wood === 200);
        return success(w);
      });
    });
  
    test('All players lose all of the chosen resource when another player plays a monopoly card', () => {
      const resources: Resources = { wool: 0, wood: 0, stone: 0, clay: 0, grain: 0};
      const p1: Player = new Player('P1');
      const devCard: DevelopmentCard = {cost: {grain: 1, stone: 1, wool: 1, wood: 0, clay: 0}, played: false, type: 'Monopoly'} as DevelopmentCard;
      p1.devCards = [devCard];
      p1.resources = resources;
  
      const p2: Player = new Player('P2');
      p2.resources = {...resources, wood: 100};
  
      const p3: Player = new Player('P2');
      p3.resources = {...resources, wood: 100};
  
      const w: World = {
        currentDie: 7,
        currentPlayer: 0,
        map: [],
        players: [p1, p2, p3],
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
  
      const initial = success(w);
      const rule = rules.PlayCard(new PlayCardAction('P1', devCard, ['Wood']));
      const applied = rule(initial);
      applied.flatMap(w => {
        expect(w.players.find(p => p.name === 'P2')?.resources.wood === 0);
        expect(w.players.find(p => p.name === 'P3')?.resources.wood === 0);
        return success(w);
      });
    });
  
    test('A player playing a "Road Building" card and can then build two roads', () => {
      const resources: Resources = { wool: 0, wood: 0, stone: 0, clay: 0, grain: 0};
      const p1: Player = new Player('P1');
      const devCard: DevelopmentCard = {cost: {grain: 1, stone: 1, wool: 1, wood: 0, clay: 0}, played: false, type: 'Road Building'} as DevelopmentCard;
      p1.devCards = [devCard];
      p1.resources = resources;
  
      const w: World = {
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
  
      const initial = success(w);
      const rule = rules.PlayCard(new PlayCardAction('P1', devCard));
      const applied = rule(initial);
      applied.flatMap(w => {
        expect(w.players.every(p => p.resources.wood === 2));
        expect(w.players.every(p => p.resources.clay === 2));
        return success(w);
      });
    });
  
    test('A player playing a "Year of Plenty" card will then have two resources of the chosen type after choosing', () => {
      const resources: Resources = { wool: 0, wood: 0, stone: 0, clay: 0, grain: 0};
      const p1: Player = new Player('P1');
      const devCard: DevelopmentCard = {cost: {grain: 1, stone: 1, wool: 1, wood: 0, clay: 0}, played: false, type: 'Year of Plenty'} as DevelopmentCard;
      p1.devCards = [devCard];
      p1.resources = resources;
  
      const w: World = {
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
  
      const initial = success(w);
      const rule = rules.PlayCard(new PlayCardAction('P1', devCard, ['Wood']));
      const applied = rule(initial);
      applied.flatMap(w => {
        expect(w.players.every(p => p.resources.wood === 2));
        return success(w);
      });
    });
  });