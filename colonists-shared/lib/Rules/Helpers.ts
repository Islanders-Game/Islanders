import { House,
  neighbouringHexCoords,
  Resources,
  Road,
  subtractResources,
  resourcesAreNonNegative,
  MatrixCoordinate,
  neighbouringMatrixCoords,
  City,
  HexCoordinate } from '../Shared';

import { Tile, DiceRoll, TileType, HarborType } from '../Tile';
import { Result, fail, success } from './Result';
import { World, GameState } from '../World';
import { Player } from '../Player';
import { addResources } from '../Resources';
import { DevelopmentCard } from '../Entities/DevelopmentCard';
import { TileRessource } from './TileRessource';
import { Conditions } from '../TurnCondition';

export const numberOfResourcesForPlayer = (houses: House[], tile: Tile): number =>
  houses.reduce((state: number, curr: House) => {
    const hexes = neighbouringHexCoords(curr.position);
    for (let i = 0; i < 3; i++) {
      if (hexes[i].x === tile.coord.x && hexes[i].y === tile.coord.y) {
        return state + curr.value;
      }
    }
    return state;
  }, 0);

export const assignNextPlayerTurn = (w: World): Result => {
  const randomGameDiceRoll = (): DiceRoll => {
    const randomToDiceFace = (roll: number) => {
      if (roll > 0 && roll <= 0.16666) {
        return 1;
      }
      if (roll > 0.16666 && roll <= 0.33333) {
        return 2;
      }
      if (roll > 0.33333 && roll <= 0.5) {
        return 3;
      }
      if (roll > 0.5 && roll <= 0.66666) {
        return 4;
      }
      if (roll > 0.66666 && roll <= 0.83333) {
        return 5;
      }
      return 6;
    };
    const firstDice = randomToDiceFace(Math.random());
    const secondDice = randomToDiceFace(Math.random());
    return (firstDice + secondDice) as DiceRoll;
  };

  const normalFilter = (tile: Tile) =>
    (w.gameState === 'Started'
      && tile.diceRoll === diceRoll
      && !(w.thief && w.thief.hexCoordinate.x === tile.coord.x && w.thief.hexCoordinate.y === tile.coord.y));

  const diceRoll = w.gameState !== 'Pregame' ? randomGameDiceRoll() : 'None';
  const players = assignRessourcesToPlayers(w, normalFilter);
  const nextPlayer = (w.currentPlayer + 1) % w.players.length;
  const newStatistics = {
    ...w.gameStatistics,
    turns: w.gameStatistics.turns + 1,
  };
  return success({
    ...w,
    players,
    currentPlayer: nextPlayer,
    currentDie: diceRoll,
    gameStatistics: newStatistics,
  });
};

export const increasePointsForPlayer = (name: string) => (w: World): Result => {
  const players = w.players.map((pl) => (pl.name === name ? {
    ...pl, points: pl.points + 1,
  } : pl));
  return success({
    ...w, players,
  });
};

export const assignRessourcesToPlayers = (w: World, tileFilter: (tile: Tile) => boolean): Player[] => {
  const players: Player[] = w.players.map((pl) => {
    const allTiles: TileRessource[] = w.map
      .filter(tileFilter)
      .map((tile) => {
        const houseAmt = numberOfResourcesForPlayer(pl.houses, tile);
        const cityAmt = numberOfResourcesForPlayer(pl.cities, tile);
        return {
          tile, amount: houseAmt + cityAmt,
        };
      });
    const resources = allTiles
      .filter((pair) => pair.amount !== 0)
      .reduce((acc: Resources, pair: TileRessource) => {
        const currentResourcesOfType = getResourceAmountOfType(pair.tile.type, acc);
        const toSet = currentResourcesOfType + pair.amount;
        const resourcesAdded = setAmountOfResourceOfType(toSet, acc, pair.tile.type);
        return resourcesAdded;
      }, pl.resources);
    return {
      ...pl, resources,
    };
  });
  return players;
};

export const getResourceAmountOfType = (type: TileType, rs: Resources): number => {
  switch (type) {
    case 'Wood':
      return rs.wood ? rs.wood : 0;
    case 'Wool':
      return rs.wool ? rs.wool : 0;
    case 'Clay':
      return rs.clay ? rs.clay : 0;
    case 'Grain':
      return rs.grain ? rs.grain : 0;
    case 'Stone':
      return rs.stone ? rs.stone : 0;
    default:
      return 0;
  }
};

export const setAmountOfResourceOfType = (amount: number, rs: Resources, type: TileType): Resources => {
  switch (type) {
    case 'Wood':
      return { ...rs, wood: amount };
    case 'Wool':
      return { ...rs, wool: amount };
    case 'Clay':
      return { ...rs, clay: amount };
    case 'Grain':
      return { ...rs, grain: amount };
    case 'Stone':
      return { ...rs, stone: amount };
    default:
      return rs;
  }
};

export const purchase = (cost: Resources) => (playerName: string) => (w: World): Result => {
  const player = w.players.find((pl) => pl.name === playerName);
  if (!player) return fail(`The player ${playerName} was not found`);
  const resources = w.conditions.playedRoadBuilding
    ? player.resources
    : subtractResources(player.resources, cost);
  if (!resourcesAreNonNegative(resources)) {
    return fail('You cannot afford this');
  }
  const players = w.players.map((pl) => (pl.name === playerName ? {
    ...pl, resources,
  } : pl));
  return success({
    ...w, players,
  });
};

export const ensureGameState = (state: GameState) => (world: World): Result =>
  world.gameState !== state ? fail('You cannot do that right now') : success(world);

export const findPlayer = (name: string) => (w: World): Result => {
  const player = w.players[w.currentPlayer];
  if (player.name !== name) {
    return fail('It is not your turn');
  }
  return success(w);
};

export const hasResources = (playerName: string, check: Resources) => (w: World): Result => {
  const player = w.players.find((p) => p.name === playerName);
  if (!player) return fail(`The player ${playerName} was not found`);
  const has = resourcesAreNonNegative(subtractResources(player.resources, check));
  if (!has) {
    return fail('You do not have the resources for this');
  }
  return success(w);
};

export const transferResources = (playerName: string, remove: Resources, assign: Resources) => (w: World): Result => {
  const player = w.players[w.currentPlayer];
  if (player.name !== playerName) {
    return fail('It is not your turn');
  }
  const subtracted = subtractResources(player.resources, remove);
  const transferred = addResources(subtracted, assign);
  const players = w.players.map((pl) => (pl.name === playerName ? {
    ...pl, resources: transferred,
  } : pl));
  return success({
    ...w, players,
  });
};

export const placeHouse = (coord: MatrixCoordinate) => (playerName: string) =>
  (hasRoad: (coordinate: HexCoordinate, p: Player) => boolean) => (world: World): Result => {
    const allHouses = world.players.reduce((acc: House[], p) => acc.concat(p.houses), []);
    const neighbouring = neighbouringMatrixCoords(coord);
    const illegalPlacement = (h: House) =>
      (h.position.x === coord.x && h.position.y === coord.y)
      || neighbouring.some((c) => c.x === h.position.x && c.y === h.position.y);
    const player = world.players.find((pl) => pl.name === playerName);
    if (!player) return fail(`The player ${playerName} was not found`);
    if (!hasRoad(coord, player)) {
      return fail('You have to place a house on a road');
    }
    const canPlace = hasRoad(coord, player) && !allHouses.some((h) => illegalPlacement(h));
    if (!canPlace) {
      return fail('You cannot place a house here');
    }
    const concatHouseIfMatch = (pl: Player) =>
      pl.name === playerName ? {
        ...pl, houses: pl.houses.concat([new House(coord)]),
      } : pl;
    const players = world.players.map((pl) => concatHouseIfMatch(pl));
    return success({
      ...world, players,
    });
  };

export const placeCity = (coord: MatrixCoordinate) => (playerName: string) => (w: World): Result => {
  const player = w.players.find((pl) => pl.name === playerName);
  if (!player) return fail(`The player ${playerName} was not found`);
  const canPlace = player.houses.some((h) => h.position.x === coord.x && h.position.y === coord.y);
  if (!canPlace) {
    return fail('You cannot place a city here');
  }
  const houses = player.houses.filter((h) => !(h.position.x === coord.x && h.position.y === coord.y));
  const cities = player.cities.concat([new City(coord)]);
  const players = w.players.map((pl) => (pl.name === playerName ? {
    ...pl, houses, cities,
  } : pl));
  return success({
    ...w, players,
  });
};

export const placeRoad = (start: MatrixCoordinate, end: MatrixCoordinate) => (playerName: string) => (
  w: World,
): Result => {
  const player = w.players.find((pl) => pl.name === playerName);
  if (!player) return fail(`The player ${playerName} was not found`);
  const allPlayerRoads = w.players.reduce((acc, p) => acc.concat(p.roads), [] as Road[]);
  const noExistingRoad = !allPlayerRoads.some(
    (ro) =>
      (ro.start.x === start.x && ro.start.y === start.y && ro.end.x === end.x && ro.end.y === end.y)
      || (ro.start.x === end.x && ro.start.y === end.y && ro.end.x === start.x && ro.end.y === start.y),
  );
  const houseAtOneEnd = player.houses.some(
    (h) => (h.position.x === start.x && h.position.y === start.y) || (h.position.x === end.x && h.position.y === end.y),
  );
  const roadAtOneEnd = player.roads.some(
    (h) =>
      (h.start.x === end.x && h.start.y === end.y)
      || (h.end.x === start.x && h.end.y === start.y)
      || (h.start.x === start.x && h.start.y === start.y)
      || (h.end.x === end.x && h.end.y === end.y),
  );
  const canPlace = noExistingRoad && (houseAtOneEnd || roadAtOneEnd);
  if (!canPlace) {
    return fail('You cannot place a road here');
  }

  const conditionIncreased: Conditions = w.conditions.playedRoadBuilding
    ? { ...w.conditions,
      playedRoadBuilding: { ...w.conditions.playedRoadBuilding,
        roadsBuilt: w.conditions.playedRoadBuilding.roadsBuilt + 1 } }
    : w.conditions;
  const roads = player.roads.concat([new Road(start, end)]);
  const players = w.players.map((pl) => (pl.name === playerName ? {
    ...pl,
    roads,
  } : pl));
  return success({
    ...w,
    players,
    conditions: conditionIncreased,
  });
};

// WARN: Unused
export const bankTrade = (start: MatrixCoordinate, end: MatrixCoordinate) => (playerName: string) => (
  w: World,
): Result => {
  const player = w.players.find((pl) => pl.name === playerName);
  if (!player) return fail(`The player ${playerName} was not found`);

  const allPlayerRoads = w.players.reduce((acc, p) => acc.concat(p.roads), [] as Road[]);
  const noExistingRoad = !allPlayerRoads.some(
    (ro) =>
      (ro.start.x === start.x && ro.start.y === start.y && ro.end.x === end.x && ro.end.y === end.y)
      || (ro.start.x === end.x && ro.start.y === end.y && ro.end.x === start.x && ro.end.y === start.y),
  );
  const houseAtOneEnd = player.houses.some(
    (h) => (h.position.x === start.x && h.position.y === start.y) || (h.position.x === end.x && h.position.y === end.y),
  );
  const roadAtOneEnd = player.roads.some(
    (h) =>
      (h.start.x === end.x && h.start.y === end.y)
      || (h.end.x === start.x && h.end.y === start.y)
      || (h.start.x === start.x && h.start.y === start.y)
      || (h.end.x === end.x && h.end.y === end.y),
  );
  const canPlace = noExistingRoad && (houseAtOneEnd || roadAtOneEnd);
  if (!canPlace) {
    return fail('You can\'t place a road here');
  }
  const roads = player.roads.concat([new Road(start, end)]);
  const players = w.players.map((pl) => (pl.name === playerName ? {
    ...pl, roads,
  } : pl));
  return success({
    ...w, players,
  });
};

export const diceRollWasSeven = (w: World): Result => {
  if (w.currentDie === 7) {
    return success(w);
  }
  return fail('You cannot move the Thief if you have not rolled a 7');
};

export const moveThiefUsingKnight = (coords: HexCoordinate) => (w: World): Result =>
  (w.conditions.playedKnight?.movedThief)
    ? fail('You cannot move the thief twice')
    : success({
      ...w,
      thief: {
        hexCoordinate: coords,
      },
      conditions: { ...w.conditions, playedKnight: { stoleFromPlayer: false, movedThief: true } },
    });

export const moveThiefUsingDiceRoll = (coords: HexCoordinate) => (w: World): Result =>
  (w.conditions.rolledASeven?.movedThief)
    ? fail('You cannot move the thief twice')
    : success({
      ...w,
      thief: {
        hexCoordinate: coords,
      },
      conditions: { ...w.conditions, rolledASeven: { movedThief: true } },
    });
