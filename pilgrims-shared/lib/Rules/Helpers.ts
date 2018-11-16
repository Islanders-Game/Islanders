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
import { Result, fail, success, Success } from './Result';
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
  // See https://www.catan.com/en/download/?SoC_rv_Rules_091907.pdf
  const roll = Math.random();
  if (roll <= 0.03) return 2;
  if (roll > 0.03 && roll <= 0.06) return 12;
  if (roll > 0.06 && roll <= 0.12) return 3;
  if (roll > 0.12 && roll <= 0.18) return 11;
  if (roll > 0.18 && roll <= 0.26) return 4;
  if (roll > 0.26 && roll <= 0.34) return 10;
  if (roll > 0.34 && roll <= 0.45) return 5;
  if (roll > 0.45 && roll <= 0.56) return 9;
  if (roll > 0.56 && roll <= 0.7) return 6;
  if (roll > 0.7 && roll <= 0.84) return 8;
  /*(roll > 0.84 && roll <= 1.00)*/ return 7;
};

export const assignNextPlayerTurn = (r: Result<World>): Result<World> => {
  if (r.tag === 'Failure') {
    return r;
  }
  const diceRoll = randomGameDiceRoll();
  const players = assignRessourcesToPlayers(r, diceRoll);
  const nextPlayer = (r.value.currentPlayer + 1) % r.value.players.length;
  const newStatistics = {
    ...r.value.gameStatistics,
    turns: r.value.gameStatistics.turns + 1,
  };
  return success({
    ...r.value,
    players,
    currentPlayer: nextPlayer,
    currentDie: diceRoll,
    gameStatistics: newStatistics,
  });
};

type TileRessource = { tile: Tile; amount: number };
export const assignRessourcesToPlayers = (
  w: Success<World>,
  diceRoll: DiceRollType,
  useDiceRoll = true,
) => {
  const players: Player[] = w.value.players.map((pl) => {
    const allTiles: TileRessource[] = w.value.map
      .filter((tile) => {
        return (
          !useDiceRoll ||
          (w.value.gameState === 'Started' &&
            tile.diceRoll === diceRoll &&
            !(
              w.value.thief &&
              (w.value.thief.hexCoordinate.x === tile.coord.x &&
                w.value.thief.hexCoordinate.y === tile.coord.y)
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
export const assignInitalRessourcesToPlayers = (w: Success<World>) => {
  const players: Player[] = w.value.players.map((pl) => {
    const allTiles: TileRessource[] = w.value.map
      .filter((tile) => {
        return (
          w.value.gameState === 'Pregame' &&
          !(
            w.value.thief &&
            (w.value.thief.hexCoordinate.x === tile.coord.x &&
              w.value.thief.hexCoordinate.y === tile.coord.y)
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
  r: Result<World>,
) => {
  if (r.tag === 'Failure') {
    return r;
  }
  const resources = subtractResources(
    r.value.players.find((pl) => pl.name === playerName)!.resources,
    cost,
  );
  if (!resourcesAreNonNegative(resources)) {
    return fail(`You cannot afford this!`);
  }
  const players = r.value.players.map((pl) =>
    pl.name === playerName ? { ...pl, resources } : pl,
  );
  return success({ ...r.value, players });
};

export const ensureGameState = (state: GameState) => (
  r: Result<World>,
): Result<World> => {
  if (r.tag === 'Failure') {
    return r;
  }
  if (r.value.gameState !== state) {
    return fail('You cannot do that action in state' + r.value.gameState);
  }
  return success(r.value);
};

export const findPlayer = (name: string) => (
  r: Result<World>,
): Result<World> => {
  if (r.tag === 'Failure') {
    return r;
  }
  const player = r.value.players[r.value.currentPlayer];
  if (player.name !== name) {
    return fail('It is not your turn!');
  }
  return success(r.value);
};

export const hasResources = (check: Resources) => (
  r: Result<World>,
): Result<World> => {
  if (r.tag === 'Failure') {
    return r;
  }
  const player = r.value.players[r.value.currentPlayer];
  if (player.name !== name) {
    return fail('It is not your turn!');
  }

  const has = resourcesAreNonNegative(
    subtractResources(player.resources, check),
  );

  if (!has) return fail('You do not have the resources for this!');
  return success(r.value);
};

export const resourcesMatchHarbor = (
  check: Resources,
  harborType: HarborType,
) => (r: Result<World>): Result<World> => {
  if (r.tag === 'Failure') {
    return r;
  }

  const error = fail('The given resources do not match the harbor!');
  switch (harborType) {
    case 'ClayHarbor':
      return check.clay >= 2 ? r : error;
    case 'GrainHarbor':
      return check.grain >= 2 ? r : error;
    case 'StoneHarbor':
      return check.grain >= 2 ? r : error;
    case 'WoodHarbor':
      return check.grain >= 2 ? r : error;
    case 'WoolHarbor':
      return check.grain >= 2 ? r : error;
    case 'ThreeToOneHarbor':
      return check.clay >= 3 ||
        check.grain >= 3 ||
        check.stone >= 3 ||
        check.wood >= 3 ||
        check.wool >= 3
        ? r
        : error;
  }
};

export const playerHasHarbor = (playerName: string, harborType: HarborType) => (
  r: Result<World>,
): Result<World> => {
  if (r.tag === 'Failure') {
    return r;
  }
  const player = r.value.players[r.value.currentPlayer];
  const tiles = r.value.map;

  const hasHarbor = player.houses.some((h) => {
    const hexes = neighbouringHexCoords(h.position);
    return hexes.some(
      (h) =>
        tiles.find((t) => t.coord.x == h.x && t.coord.y == h.y)!.type ==
        harborType,
    );
  });

  if (!hasHarbor)
    return fail('You do not have a house on a harbor for this trade!');
  return r;
};

export const transferResources = (
  playerName: string,
  remove: Resources,
  assign: Resources,
) => (r: Result<World>): Result<World> => {
  if (r.tag === 'Failure') {
    return r;
  }
  const player = r.value.players[r.value.currentPlayer];
  if (player.name !== name) {
    return fail('It is not your turn!');
  }

  const subtracted = subtractResources(player.resources, remove);
  const transferred = addResources(subtracted, assign);

  const players = r.value.players.map((pl) =>
    pl.name === playerName ? { ...pl, resources: transferred } : pl,
  );

  return success({ ...r.value, players });
};

export const placeHouseInital = (coord: MatrixCoordinate) => (
  playerName: string,
) => (world: Result<World>) => {
  if (world.tag === 'Failure') {
    return world;
  }
  const allHouses = world.value.players.reduce(
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
  const players = world.value.players.map((pl) => concatHouseIfMatch(pl));
  return success({ ...world.value, players });
};

export const placeHouse = (coord: MatrixCoordinate) => (playerName: string) => (
  world: Result<World>,
) => {
  if (world.tag === 'Failure') {
    return world;
  }
  const allHouses = world.value.players.reduce(
    (acc: House[], p) => acc.concat(p.houses),
    [],
  );
  const neighbouring = neighbouringMatrixCoords(coord);

  const illegalPlacement = (h: House) =>
    (h.position.x === coord.x && h.position.y === coord.y) ||
    neighbouring.some((c) => c.x === h.position.x && c.y === h.position.y);

  const player = world.value.players.find((pl) => pl.name === playerName)!;
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
  const players = world.value.players.map((pl) => concatHouseIfMatch(pl));
  return success({ ...world.value, players });
};

export const placeCity = (coord: MatrixCoordinate) => (playerName: string) => (
  r: Result<World>,
) => {
  if (r.tag === 'Failure') {
    return r;
  }
  const player = r.value.players.find((pl) => pl.name === playerName)!;
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
  const players = r.value.players.map((pl) =>
    pl.name === playerName ? { ...pl, houses, cities } : pl,
  );
  return success({ ...r.value, players });
};

export const placeRoad = (start: MatrixCoordinate, end: MatrixCoordinate) => (
  playerName: string,
) => (r: Result<World>) => {
  if (r.tag === 'Failure') {
    return r;
  }
  const player = r.value.players.find((pl) => pl.name === playerName)!;

  const allPlayerRoads = r.value.players.reduce(
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
  const players = r.value.players.map((pl) =>
    pl.name === playerName ? { ...pl, roads } : pl,
  );
  return success({ ...r.value, players });
};

export const assignDevelopmentCard = (playerName: string) => (
  r: Result<World>,
) => {
  if (r.tag === 'Failure') {
    return r;
  }

  const randomCard = new DevelopmentCard();
  const player = r.value.players.find((pl) => pl.name === playerName)!;
  const newCards = player.devCards.concat(randomCard);
  const players = r.value.players.map((pl) =>
    pl.name === playerName ? { ...pl, devCards: newCards } : pl,
  );
  return success({ ...r.value, players });
};

export const playCard = (
  playerName: string,
  card: DevelopmentCard,
  chosenResources: TileType | [TileType, TileType],
) => (r: Result<World>) => {
  if (r.tag === 'Failure') {
    return r;
  }

  //Nasty... Couldn't see any other way.
  //Clone existing card array, modify card played state.
  const newCards = (r.value.players
    .find((p) => p.name === playerName)!
    .devCards.slice(0)
    .find((c) => c.type == card.type && !c.played)!.played = true);

  if (card.type === 'Victory Point') {
    const players = r.value.players.map((pl) =>
      pl.name === playerName
        ? { ...pl, points: pl.points + 1, devCards: newCards }
        : pl,
    );
    return success({ players, ...r.value });
  }

  if (card.type === 'Knight') {
    const players = r.value.players.map((pl) =>
      pl.name === playerName
        ? { ...pl, knights: pl.knights + 1, devCards: newCards }
        : pl,
    );
    return success({ players, ...r.value });
  }

  if (card.type === 'Road Building') {
    const resources = r.value.players.find((pl) => pl.name === playerName)!
      .resources;
    const roadCost = new Road().cost;
    const withTwoExtraRoads = addResources(
      addResources(resources, roadCost),
      roadCost,
    );
    const players = r.value.players.map((pl) =>
      pl.name === playerName
        ? { ...pl, resources: withTwoExtraRoads, devCards: newCards }
        : pl,
    );
    return success({ players, ...r.value });
  }

  if (card.type === 'Year of Plenty') {
    const chosen = chosenResources as [TileType, TileType];
    const resources = r.value.players.find((pl) => pl.name === playerName)!
      .resources;
    const rr = addAmountToResourceOfType(1, resources, chosen[0]);
    const rrr = addAmountToResourceOfType(1, rr, chosen[1]);
    const players = r.value.players.map((pl) =>
      pl.name === playerName
        ? { ...pl, resources: rrr, devCards: newCards }
        : pl,
    );

    return success({ players, ...r.value });
  }

  if (card.type === 'Monopoly') {
    const resources = r.value.players.find((pl) => pl.name === playerName)!
      .resources;
    const allResources = r.value.players.reduce(
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
    const players = r.value.players.map((pl) =>
      pl.name === playerName
        ? { ...pl, resources: added }
        : { ...pl, resources: deleteAllResourcesOfType(chosen, pl.resources) },
    );
    return success({ players, ...r.value });
  }

  return r;
};

export const getResourceAmountOfType = (type: TileType, rs: Resources) => {
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
) => {
  let toAdd: Resources = { wood: 0, grain: 0, stone: 0, wool: 0, clay: 0 };
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

export const deleteAllResourcesOfType = (type: TileType, rs: Resources) => {
  switch (type) {
    case 'Wood':
      return { wood: 0, ...rs };
    case 'Wool':
      return { wool: 0, ...rs };
    case 'Clay':
      return { clay: 0, ...rs };
    case 'Grain':
      return { grain: 0, ...rs };
    case 'Stone':
      return { stone: 0, ...rs };
    default:
      return rs;
  }
};

export const bankTrade = (start: MatrixCoordinate, end: MatrixCoordinate) => (
  playerName: string,
) => (r: Result<World>) => {
  if (r.tag === 'Failure') {
    return r;
  }
  const player = r.value.players.find((pl) => pl.name === playerName)!;

  const allPlayerRoads = r.value.players.reduce(
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
  const players = r.value.players.map((pl) =>
    pl.name === playerName ? { ...pl, roads } : pl,
  );
  return success({ ...r.value, players });
};

export const diceRollWasSeven = (r: Result<World>) => {
  if (r.tag == 'Failure') {
    return r;
  }
  if (r.value.currentDie == 7) {
    return r;
  }
  return fail('You cannot move the Thief if you have not rolled a 7!');
};

export const moveThief = (coords: HexCoordinate) => (r: Result<World>) => {
  if (r.tag == 'Failure') {
    return r;
  }
  return success({ thief: { hexCoordinate: coords }, ...r.value });
};

export const developmentCardHasNotBeenPlayed = (
  developmentCard: DevelopmentCard,
) => (r: Result<World>) => {
  if (developmentCard.played) {
    return fail('This card has already been played!');
  }

  return r;
};
