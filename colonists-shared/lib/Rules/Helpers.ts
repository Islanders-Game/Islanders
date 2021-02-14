import {
  House,
  neighbouringHexCoords,
  Resources,
  Road,
  subtractResources,
  resourcesAreNonNegative,
  MatrixCoordinate,
  neighbouringMatrixCoords,
  City,
  HexCoordinate,
} from '../Shared';

import { Tile, DiceRollType, TileType, HarborType } from '../Tile';
import { Result, fail, success } from './Result';
import { World, GameState } from '../World';
import { Player } from '../Player';
import { addResources } from '../Resources';
import { DevelopmentCard } from '../Entities/DevelopmentCard';

export const numberOfResourcesForPlayer = (
  houses: House[],
  tile: Tile,
): number => {
  return houses.reduce((state: number, curr: House) => {
    const hexes = neighbouringHexCoords(curr.position);
    for (let i = 0; i < 3; i++) {
      if (hexes[i].x === tile.coord.x && hexes[i].y === tile.coord.y) {
        return state + curr.value;
      }
    }
    return state;
  }, 0);
};

export const randomGameDiceRoll = (): DiceRollType => {
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
  }
  const firstDice = randomToDiceFace(Math.random());
  const secondDice = randomToDiceFace(Math.random());
  return firstDice + secondDice as DiceRollType;
};

export const assignNextPlayerTurn = (w: World): Result => {
  const diceRoll = w.gameState !== 'Pregame' ? randomGameDiceRoll() : 'None';
  const players = assignRessourcesToPlayers(w, diceRoll);
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
  const players = w.players.map((pl) =>
    pl.name === name ? { ...pl, points: pl.points+1 } : pl,
  );
  return success({ ...w, players });
} 

type TileRessource = { tile: Tile; amount: number };
export const assignRessourcesToPlayers = (
  w: World,
  diceRoll: DiceRollType,
  useDiceRoll = true,
): Player[] => {
  const players: Player[] = w.players.map((pl) => {
    const allTiles: TileRessource[] = w.map
      .filter((tile) => {
        return (
          !useDiceRoll ||
          (w.gameState === 'Started' &&
            tile.diceRoll === diceRoll &&
            !(
              w.thief &&
              (w.thief.hexCoordinate.x === tile.coord.x &&
                w.thief.hexCoordinate.y === tile.coord.y)
            ))
        );
      })
      .map((tile) => {
        const houseAmt = numberOfResourcesForPlayer(pl.houses, tile);
        const cityAmt = numberOfResourcesForPlayer(pl.cities, tile);
        return { tile, amount: houseAmt + cityAmt };
      });
    const resources: Resources = allTiles
      .filter((pair) => pair.amount !== 0)
      .reduce((state, pair) => {
        return addAmountToResourceOfType(pair.amount, state, pair.tile.type);
      }, pl.resources);
    return { ...pl, resources };
  });
  return players;
};

// assign the resources that the players have houses up to
export const assignInitalRessourcesToPlayers = (w: World): Player[] => {
  const players: Player[] = w.players.map((pl) => {
    const allTiles: TileRessource[] = w.map
      .filter((tile) => {
        return (
          w.gameState === 'Pregame' &&
          !(
            w.thief &&
            (w.thief.hexCoordinate.x === tile.coord.x &&
              w.thief.hexCoordinate.y === tile.coord.y)
          )
        );
      })
      .map((tile) => {
        const houseAmt = numberOfResourcesForPlayer(pl.houses, tile);
        const cityAmt = numberOfResourcesForPlayer(pl.cities, tile);
        return { tile, amount: houseAmt + cityAmt };
      });
    const resources: Resources = allTiles
      .filter((pair) => pair.amount !== 0)
      .reduce((state, pair) => {
        return addAmountToResourceOfType(pair.amount, state, pair.tile.type);
      }, pl.resources);
    return { ...pl, resources };
  });
  return players;
};

export const purchase = (cost: Resources) => (playerName: string) => (
  w: World,
): Result => {
  const player = w.players.find((pl) => pl.name === playerName);
  if (!player) return fail(`The player ${playerName} was not found!`);
  const resources = subtractResources(
    player.resources,
    cost,
  );
  if (!resourcesAreNonNegative(resources)) {
    return fail(`You cannot afford this!`);
  }
  const players = w.players.map((pl) =>
    pl.name === playerName ? { ...pl, resources } : pl,
  );
  return success({ ...w, players });
};

export const ensureGameState = (state: GameState) => (world: World): Result =>
  world.gameState !== state
    ? fail('You cannot do that right now!' + world.gameState)
    : success(world);

export const findPlayer = (name: string) => (w: World): Result => {
  const player = w.players[w.currentPlayer];
  if (player.name !== name) {
    return fail('It is not your turn!');
  }
  return success(w);
};

export const hasResources = (playerName: string, check: Resources) => (
  w: World,
): Result => {
  const player = w.players.find((p) => p.name === playerName);
  if (!player) return fail(`The player ${playerName} was not found!`);
  const has = resourcesAreNonNegative(
    subtractResources(player.resources, check),
  );
  if (!has) {
    return fail('You do not have the resources for this!');
  }
  return success(w);
};

export const resourcesMatchHarbor = (
  check: Resources,
  harborType: HarborType,
) => (w: World): Result => {
  const e = fail('The given resources do not match the harbor!');
  const s = success(w);
  switch (harborType) {
    case 'ClayHarbor':
      return check.clay >= 2 ? s : e;
    case 'GrainHarbor':
      return check.grain >= 2 ? s : e;
    case 'StoneHarbor':
      return check.grain >= 2 ? s : e;
    case 'WoodHarbor':
      return check.grain >= 2 ? s : e;
    case 'WoolHarbor':
      return check.grain >= 2 ? s : e;
    case 'ThreeToOneHarbor':
      return check.clay >= 3 ||
        check.grain >= 3 ||
        check.stone >= 3 ||
        check.wood >= 3 ||
        check.wool >= 3
        ? s
        : e;
  }
};

export const playerHasHarbor = (playerName: string, harborType: HarborType) => (
  w: World,
): Result => {
  const player = w.players[w.currentPlayer];
  const tiles = w.map;
  const hasHarbor = player.houses.some((house) => {
    const hexes = neighbouringHexCoords(house.position);
    return hexes.some(
      (h) => {
        const tile = tiles.find((t) => t.coord.x === h.x && t.coord.y === h.y)
        return tile && tile.type === harborType
      }
    );
  });
  if (!hasHarbor) {
    return fail('You do not have a house on a harbor for this trade!');
  }
  return success(w);
};

export const transferResources = (
  playerName: string,
  remove: Resources,
  assign: Resources,
) => (w: World): Result => {
  const player = w.players[w.currentPlayer];
  if (player.name !== playerName) {
    return fail('It is not your turn!');
  }
  const subtracted = subtractResources(player.resources, remove);
  const transferred = addResources(subtracted, assign);
  const players = w.players.map((pl) =>
    pl.name === playerName ? { ...pl, resources: transferred } : pl,
  );
  return success({ ...w, players });
};

export const placeHouseInital = (coord: MatrixCoordinate) => (
  playerName: string,
) => (world: World): Result => {
  const allHouses = world.players.reduce(
    (acc: House[], p) => acc.concat(p.houses),
    [],
  );
  const neighbouring = neighbouringMatrixCoords(coord);
  const illegalPlacement = (h: House) =>
    (h.position.x === coord.x && h.position.y === coord.y) ||
    neighbouring.some((c) => c.x === h.position.x && c.y === h.position.y);
  const canPlace = !allHouses.some((h) => illegalPlacement(h));
  if (!canPlace) {
    return fail(`Can't place a house here!`);
  }
  const concatHouseIfMatch = (pl: Player) =>
    pl.name === playerName
      ? { ...pl, houses: pl.houses.concat([new House(coord)]) }
      : pl;
  const players = world.players.map((pl) => concatHouseIfMatch(pl));
  return success({ ...world, players });
};

export const placeHouse = (coord: MatrixCoordinate) => (playerName: string) => (
  world: World,
): Result => {
  const allHouses = world.players.reduce(
    (acc: House[], p) => acc.concat(p.houses),
    [],
  );
  const neighbouring = neighbouringMatrixCoords(coord);
  const illegalPlacement = (h: House) =>
    (h.position.x === coord.x && h.position.y === coord.y) ||
    neighbouring.some((c) => c.x === h.position.x && c.y === h.position.y);
  const player = world.players.find((pl) => pl.name === playerName);
  if (!player) return fail(`The player ${playerName} was not found!`);
  const hasRoad = player.roads.some(
    (r) =>
      (r.start.x === coord.x && r.start.y === coord.y) ||
      (r.end.x === coord.x && r.end.y === coord.y),
  );
  if (!hasRoad) {
    return fail('You have to place a house on a road!');
  }
  const canPlace = hasRoad && !allHouses.some((h) => illegalPlacement(h));
  if (!canPlace) {
    return fail(`Can't place a house here!`);
  }
  const concatHouseIfMatch = (pl: Player) =>
    pl.name === playerName
      ? { ...pl, houses: pl.houses.concat([new House(coord)]) }
      : pl;
  const players = world.players.map((pl) => concatHouseIfMatch(pl));
  return success({ ...world, players });
};

export const placeCity = (coord: MatrixCoordinate) => (playerName: string) => (
  w: World,
): Result => {
  const player = w.players.find((pl) => pl.name === playerName);
  if (!player) return fail(`The player ${playerName} was not found!`);
  const canPlace = player.houses.some(
    (h) => h.position.x === coord.x && h.position.y === coord.y,
  );
  if (!canPlace) {
    return fail(`Can't place a city here!`);
  }
  const houses = player.houses.filter(
    (h) => !(h.position.x === coord.x && h.position.y === coord.y),
  );
  const cities = player.cities.concat([new City(coord)]);
  const players = w.players.map((pl) =>
    pl.name === playerName ? { ...pl, houses, cities } : pl,
  );
  return success({ ...w, players });
};

export const placeRoad = (start: MatrixCoordinate, end: MatrixCoordinate) => (
  playerName: string,
) => (w: World): Result => {
  const player = w.players.find((pl) => pl.name === playerName);
  if (!player) return fail(`The player ${playerName} was not found!`);
  const allPlayerRoads = w.players.reduce(
    (acc, p) => acc.concat(p.roads),
    [] as Road[],
  );
  const noExistingRoad = !allPlayerRoads.some(
    (ro) =>
      (ro.start.x === start.x &&
        ro.start.y === start.y &&
        ro.end.x === end.x &&
        ro.end.y === end.y) ||
      (ro.start.x === end.x &&
        ro.start.y === end.y &&
        ro.end.x === start.x &&
        ro.end.y === start.y),
  );
  const houseAtOneEnd = player.houses.some(
    (h) =>
      (h.position.x === start.x && h.position.y === start.y) ||
      (h.position.x === end.x && h.position.y === end.y),
  );
  const roadAtOneEnd = player.roads.some(
    (h) =>
      (h.start.x === end.x && h.start.y === end.y) ||
      (h.end.x === start.x && h.end.y === start.y) ||
      (h.start.x === start.x && h.start.y === start.y) ||
      (h.end.x === end.x && h.end.y === end.y),
  );
  const canPlace = noExistingRoad && (houseAtOneEnd || roadAtOneEnd);
  if (!canPlace) {
    return fail(`You can't place a road here!`);
  }
  const roads = player.roads.concat([new Road(start, end)]);
  const players = w.players.map((pl) =>
    pl.name === playerName ? { ...pl, roads } : pl,
  );
  return success({ ...w, players });
};

export const assignDevelopmentCard = (playerName: string) => (w: World): Result => {
  const randomCard = new DevelopmentCard();
  const player = w.players.find((pl) => pl.name === playerName);
  if (!player) return fail(`The player ${playerName} was not found!`);
  const newCards = player.devCards.concat(randomCard);
  const players = w.players.map((pl) =>
    pl.name === playerName ? { ...pl, devCards: newCards } : pl,
  );
  return success({ ...w, players });
};

export const playCard = (
  playerName: string,
  card: DevelopmentCard,
  chosenResources: TileType | [TileType, TileType],
) => (w: World): Result => {
  // Nasty... Couldn't see any other way.
  // Clone existing card array, modify card played state.
  const player = w.players.find((p) => p.name === playerName);
  if (!player) return fail(`The player ${playerName} was not found!`);
  const devCards = player.devCards.slice();
  const toPlay = devCards.find((c) => c.type === card.type && !c.played);
  if (!toPlay) {
    return fail("You do not have that card!");
  }

  //Side effect!
  toPlay.played = true;

  if (card.type === 'Victory Point') {
    const players = w.players.map((pl) =>
      pl.name === playerName
        ? { ...pl, points: pl.points + 1, devCards: devCards }
        : pl,
    );
    return success({ ...w, players });
  }
  if (card.type === 'Knight') {
    const players = w.players.map((pl) =>
      pl.name === playerName
        ? { ...pl, knights: pl.knights + 1, devCards: devCards }
        : pl,
    );
    return success({ ...w, players });
  }
  if (card.type === 'Road Building') {
    const player = w.players.find((pl) => pl.name === playerName);
    if (!player) return fail(`The player ${playerName} was not found!`);
    const resources = player.resources;
    const roadCost = new Road().cost;
    const withTwoExtraRoads = addResources(
      addResources(resources, roadCost),
      roadCost,
    );
    const players = w.players.map((pl) =>
      pl.name === playerName
        ? { ...pl, resources: withTwoExtraRoads, devCards: devCards }
        : pl,
    );
    return success({ ...w, players });
  }
  if (card.type === 'Year of Plenty') {
    const chosen = chosenResources as [TileType, TileType];
    const player = w.players.find((pl) => pl.name === playerName);
    if (!player) return fail(`The player ${playerName} was not found!`);
    const resources = player.resources;
    const rr = addAmountToResourceOfType(1, resources, chosen[0]);
    const rrr = addAmountToResourceOfType(1, rr, chosen[1]);
    const players = w.players.map((pl) =>
      pl.name === playerName
        ? { ...pl, resources: rrr, devCards: devCards }
        : pl,
    );

    return success({ ...w, players });
  }
  if (card.type === 'Monopoly') {
    const player = w.players.find((pl) => pl.name === playerName);
    if (!player) return fail(`The player ${playerName} was not found!`);
    const resources = player.resources;
    const allResources = w.players.reduce(
      (acc, p) => acc.concat(p.resources),
      [] as Resources[],
    );
    const chosen = chosenResources as TileType;
    const toTake = allResources.reduce(
      (acc, rr) => acc + getResourceAmountOfType(chosen, rr),
      0,
    );
    const added = addAmountToResourceOfType(
      toTake,
      resources,
      chosenResources as TileType,
    );
    const players = w.players.map((pl) =>
      pl.name === playerName
        ? { ...pl, resources: added }
        : { ...pl, resources: deleteAllResourcesOfType(chosen, pl.resources) },
    );
    return success({ ...w, players });
  }
  return success(w);
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

export const addAmountToResourceOfType = (
  amount: number,
  rs: Resources,
  type: TileType,
): Resources => {
  const toAdd: Resources = { wood: 0, grain: 0, stone: 0, wool: 0, clay: 0 };
  switch (type) {
    case 'Wood':
      toAdd.wood += amount;
      break;
    case 'Wool':
      toAdd.wool += amount;
      break;
    case 'Clay':
      toAdd.clay += amount;
      break;
    case 'Grain':
      toAdd.grain += amount;
      break;
    case 'Stone':
      toAdd.stone += amount;
      break;
    default:
      return rs;
  }
  return addResources(toAdd, rs);
};

export const deleteAllResourcesOfType = (type: TileType, rs: Resources): Resources => {
  switch (type) {
    case 'Wood':
      return { ...rs, wood: 0 };
    case 'Wool':
      return { ...rs, wool: 0 };
    case 'Clay':
      return { ...rs, clay: 0 };
    case 'Grain':
      return { ...rs, grain: 0 };
    case 'Stone':
      return { ...rs, stone: 0 };
    default:
      return rs;
  }
};

export const bankTrade = (start: MatrixCoordinate, end: MatrixCoordinate) => (
  playerName: string,
) => (w: World): Result => {
  const player = w.players.find((pl) => pl.name === playerName);
  if (!player) return fail(`The player ${playerName} was not found!`);

  const allPlayerRoads = w.players.reduce(
    (acc, p) => acc.concat(p.roads),
    [] as Road[],
  );
  const noExistingRoad = !allPlayerRoads.some(
    (ro) =>
      (ro.start.x === start.x &&
        ro.start.y === start.y &&
        ro.end.x === end.x &&
        ro.end.y === end.y) ||
      (ro.start.x === end.x &&
        ro.start.y === end.y &&
        ro.end.x === start.x &&
        ro.end.y === start.y),
  );
  const houseAtOneEnd = player.houses.some(
    (h) =>
      (h.position.x === start.x && h.position.y === start.y) ||
      (h.position.x === end.x && h.position.y === end.y),
  );
  const roadAtOneEnd = player.roads.some(
    (h) =>
      (h.start.x === end.x && h.start.y === end.y) ||
      (h.end.x === start.x && h.end.y === start.y) ||
      (h.start.x === start.x && h.start.y === start.y) ||
      (h.end.x === end.x && h.end.y === end.y),
  );
  const canPlace = noExistingRoad && (houseAtOneEnd || roadAtOneEnd);
  if (!canPlace) {
    return fail(`You can't place a road here!`);
  }
  const roads = player.roads.concat([new Road(start, end)]);
  const players = w.players.map((pl) =>
    pl.name === playerName ? { ...pl, roads } : pl,
  );
  return success({ ...w, players });
};

export const diceRollWasSeven = (w: World): Result => {
  if (w.currentDie === 7) {
    return success(w);
  }
  return fail('You cannot move the Thief if you have not rolled a 7!');
};

export const moveThief = (coords: HexCoordinate) => (w: World): Result => {
  return success({ ...w, thief: { hexCoordinate: coords }, lastThiefPosition: { hexCoordinate: coords }});
};

export const developmentCardHasNotBeenPlayed = (
  developmentCard: DevelopmentCard,
) => (w: World): Result => {
  if (developmentCard.played) {
    return fail('This card has already been played!');
  }
  return success(w);
};
