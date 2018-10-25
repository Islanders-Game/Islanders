import { Result, success, fail } from './Result';
import { World } from './World';
import { MatrixCoordinate } from './MatrixCoordinate';
import {
  Resources,
  subtractResources,
  resourcesAreNonNegative,
  addResources,
} from './Resources';
import { Road } from './Entities/Road';
import { City } from './Entities/City';
import { House } from './Entities/House';
import {
  BuildHouseAction,
  BuildCityAction,
  BuildRoadAction,
  PlaceThiefAction,
  BuyCardAction,
  PlayCardAction,
  TradeAction,
  StartGameAction,
  EndTurnAction,
} from './Action';
import {
  neighbouringMatrixCoords,
  neighbouringHexCoords,
  Tile,
  Player,
  Success,
} from './Shared';
import { randomDiceRoll } from './WorldGenerator';
import { DiceRollType } from './Tile';

export type Rule = (w: Result<World>) => Result<World>;
export interface Rules {
  BuildHouse: (data: BuildHouseAction) => (w: Result<World>) => Result<World>;
  BuildCity: (data: BuildCityAction) => (w: Result<World>) => Result<World>;
  BuildRoad: (data: BuildRoadAction) => (w: Result<World>) => Result<World>;
  MoveThief: (data: PlaceThiefAction) => (w: Result<World>) => Result<World>;
  BuyCard: (data: BuyCardAction) => (w: Result<World>) => Result<World>;
  PlayCard: (data: PlayCardAction) => (w: Result<World>) => Result<World>;
  Trade: (data: TradeAction) => (w: Result<World>) => Result<World>;
  StartGame: (data: StartGameAction) => (w: Result<World>) => Result<World>;
  EndTurn: (data: EndTurnAction) => (w: Result<World>) => Result<World>;
}

export const ruleReducer = (
  acc: Result<World>,
  curr: ((x: Result<World>) => Result<World>),
) => curr(acc);

//
// ---- Rule implementations ----
//
export const rules: Rules = {
  BuildHouse: ({ parameters }) => (w) => {
    if (w.tag === 'Failure') {
      return w;
    }
    const playerExists = findPlayer(parameters.playerName)(w);
    const purchased = purchase(new House().cost)(parameters.playerName)(
      playerExists,
    );
    const placed = placeHouse(parameters.coordinates)(parameters.playerName)(
      purchased,
    );
    return placed;
  },
  BuildCity: ({ parameters }) => (w) => {
    if (w.tag === 'Failure') {
      return w;
    }
    const playerExists = findPlayer(parameters.playerName)(w);
    const purchased = purchase(new City().cost)(parameters.playerName)(
      playerExists,
    );
    return placeCity(parameters.coordinates)(parameters.playerName)(purchased);
  },
  BuildRoad: ({ parameters }) => (w) => {
    if (w.tag === 'Failure') {
      return w;
    }
    const playerExists = findPlayer(parameters.playerName)(w);
    const purchased = purchase(new Road().cost)(parameters.playerName)(
      playerExists,
    );
    return placeRoad(parameters.start, parameters.end)(parameters.playerName)(
      purchased,
    );
  },
  MoveThief: ({ parameters }) => (w) => w,
  BuyCard: ({ parameters }) => (w) => w,
  PlayCard: ({ parameters }) => (w) => w,
  Trade: ({ parameters }) => (w) => w,
  StartGame: () => (w) => {
    if (w.tag === 'Failure') {
      return w;
    }
    const players = assignRessourcesToPlayers(w, 'None', false);
    return success({
      ...w.value,
      players,
      started: true,
    });
  },
  EndTurn: ({ parameters }) => (w) => {
    if (w.tag === 'Failure') {
      return w;
    }
    const player = findPlayer(parameters.playerName)(w);
    if (player.tag === 'Failure') {
      return player;
    }

    const diceRoll = randomDiceRoll();
    const players = assignRessourcesToPlayers(w, diceRoll);
    const nextPlayer = (w.value.currentPlayer + 1) % w.value.players.length;
    return success({
      ...w.value,
      players,
      currentPlayer: nextPlayer,
      currentDie: diceRoll,
    });
  },
};

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

type TileRessource = { tile: Tile; amount: number };
const assignRessourcesToPlayers = (
  w: Success<World>,
  diceRoll: DiceRollType,
  useDiceRoll = true,
) => {
  const players: Player[] = w.value.players.map((pl) => {
    const allTiles: TileRessource[] = w.value.map
      .filter((tile) => {
        return (
          !useDiceRoll ||
          (tile.diceRoll === diceRoll &&
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
        return addResources(state, {
          [pair.tile.type.toLowerCase()]: pair.amount,
        });
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
  const players = r.value.players.map(
    (pl) => (pl.name === playerName ? { ...pl, resources } : pl),
  );
  return success({ ...r.value, players });
};

const findPlayer = (name: string) => (r: Result<World>): Result<World> => {
  if (r.tag === 'Failure') {
    return r;
  }
  const player = r.value.players[r.value.currentPlayer];
  if (player.name !== name) {
    return fail('It is not your turn!');
  }
  return success(r.value);
};

const placeHouse = (coord: MatrixCoordinate) => (playerName: string) => (
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
  const canPlace = !allHouses.some(
    (h) =>
      (h.position.x === coord.x && h.position.y === coord.y) ||
      neighbouring.some(
        (pos) => pos.x === h.position.x && pos.y === h.position.y,
      ),
  );
  if (!canPlace) {
    return fail(`Can't place a house here!`);
  }
  const players = world.value.players.map(
    (pl) =>
      pl.name === playerName
        ? { ...pl, houses: pl.houses.concat([new House(coord)]) }
        : pl,
  );
  return success({ ...world.value, players });
};

const placeCity = (coord: MatrixCoordinate) => (playerName: string) => (
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
  const players = r.value.players.map(
    (pl) => (pl.name === playerName ? { ...pl, houses, cities } : pl),
  );
  return success({ ...r.value, players });
};

const placeRoad = (start: MatrixCoordinate, end: MatrixCoordinate) => (
  playerName: string,
) => (r: Result<World>) => {
  if (r.tag === 'Failure') {
    return r;
  }
  const player = r.value.players.find((pl) => pl.name === playerName)!;

  const canPlace = player.roads.some(
    (ro) => ro.start !== start && ro.end !== end,
  );
  if (!canPlace) {
    return fail(`Can't place a road here!`);
  }
  const roads = player.roads.concat([new Road(start, end)]);
  const players = r.value.players.map(
    (pl) => (pl.name === playerName ? { ...pl, roads } : pl),
  );
  return success({ ...r.value, players });
};
