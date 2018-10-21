import { Result, success, fail } from './Result';
import { World } from './World';
import { MatrixCoordinate } from './MatrixCoordinate';
import { HexCoordinate } from './HexCoordinate';
import { DevelopmentCard } from './Entities/DevelopmentCard';
import {
  Resources,
  subtractResources,
  resourcesAreNonNegative,
} from './Resources';
import { Road } from './Entities/Road';
import { City } from './Entities/City';
import { House } from './Entities/House';
import { Player } from './Player';
import {
  BuildHouseAction,
  BuildCityAction,
  BuildRoadAction,
  PlaceThiefAction,
  BuyCardAction,
  PlayCardAction,
  TradeAction,
} from './Action';

export type Rule = (w: Result<World>) => Result<World>;
export interface Rules {
  BuildHouse: (data: BuildHouseAction) => (w: Result<World>) => Result<World>;
  BuildCity: (data: BuildCityAction) => (w: Result<World>) => Result<World>;
  BuildRoad: (data: BuildRoadAction) => (w: Result<World>) => Result<World>;
  MoveThief: (data: PlaceThiefAction) => (w: Result<World>) => Result<World>;
  BuyCard: (data: BuyCardAction) => (w: Result<World>) => Result<World>;
  PlayCard: (data: PlayCardAction) => (w: Result<World>) => Result<World>;
  Trade: (data: TradeAction) => (w: Result<World>) => Result<World>;
}

export const ruleReducer = (
  acc: Result<World>,
  curr: ((x: Result<World>) => Result<World>),
) => curr(acc);

//
// ---- Rule implementations ----
//
export const rules: Rules = {
  BuildHouse: ({ type, parameters }) => (w) => {
    if (w.tag === 'Failure') {
      return w;
    }
    const player = findPlayer(parameters.playerID)(w);
    const purchased = purchase(new House().cost)(player)(w);
    const placed = placeHouse(parameters.coordinates)(player)(purchased);
    return placed;
  },
  BuildCity: ({ type, parameters }) => (w) => {
    if (w.tag === 'Failure') {
      return w;
    }
    const player = findPlayer(parameters.playerID)(w);
    const purchased = purchase(new City().cost)(player)(w);
    return placeCity(parameters.coordinates)(player)(purchased);
  },
  BuildRoad: ({ type, parameters }) => (w) => {
    if (w.tag === 'Failure') {
      return w;
    }
    const player = findPlayer(parameters.playerID)(w);
    const purchased = purchase(new Road().cost)(player)(w);
    return placeRoad(parameters.start, parameters.end)(player)(purchased);
  },
  MoveThief: ({ type, parameters }) => (w) => w, // TODO: Implement rules.
  BuyCard: ({ type, parameters }) => (w) => w,
  PlayCard: ({ type, parameters }) => (w) => w,
  Trade: ({ type, parameters }) => (w) => w,
};

export const purchase = (cost: Resources) => (p: Result<Player>) => (
  r: Result<World>,
) => {
  if (r.tag === 'Failure') {
    return r;
  }
  if (p.tag === 'Failure') {
    return p;
  }
  const resources = subtractResources(p.world.resources, cost);
  if (!resourcesAreNonNegative(resources)) {
    return fail(`Player ${p.world.id} cannot afford this.`);
  }
  const players = r.world.players.map(
    (pl) => (pl.id === p.world.id ? { ...p.world, resources } : pl),
  );
  return success({ ...r.world, players });
};

const findPlayer = (uuid: string) => (r: Result<World>) => {
  if (r.tag === 'Failure') {
    return r;
  }
  const player = r.world.players.find((pl) => pl.id === uuid);
  if (!player) {
    return fail(`Player ${uuid} not found.`);
  }
  return success(player);
};

const placeHouse = (coord: MatrixCoordinate) => (p: Result<Player>) => (
  r: Result<World>,
) => {
  if (r.tag === 'Failure') {
    return r;
  }
  if (p.tag === 'Failure') {
    return p;
  }
  const allHouses = r.world.players.reduce(
    (acc: House[], p) => acc.concat(p.houses),
    [],
  );
  const canPlace = allHouses.every(
    (h) =>
      h.position.x !== coord.x &&
      h.position.y !== coord.y &&
      (h.position.y !== coord.y - 1 && h.position.x !== coord.x - 1) && // Adjecent matrix corners.
      (h.position.y !== coord.y - 1 && h.position.x !== coord.x + 1) && // Adjecent matrix corners.
      (h.position.y !== coord.y + 1 && h.position.x !== coord.x - 1) && // Adjecent matrix corners.
      (h.position.y !== coord.y + 1 && h.position.x !== coord.x + 1),
  );
  if (!canPlace) {
    return fail('Cannot place a house here!');
  }
  const addedHouse = p.world.houses.concat([new House(coord)]);
  const players = r.world.players.map(
    (pl) => (pl.id === p.world.id ? { ...p.world, houses: addedHouse } : pl),
  );
  return success({ ...r.world, players });
};

const placeCity = (coord: MatrixCoordinate) => (p: Result<Player>) => (
  r: Result<World>,
) => {
  if (r.tag === 'Failure') {
    return r;
  }
  if (p.tag === 'Failure') {
    return p;
  }
  const canPlace = p.world.houses.some(
    (h) => h.position.x === coord.x && h.position.y === coord.y,
  );
  if (!canPlace) {
    return fail('Cannot place a house here!');
  }
  const houses = p.world.houses.filter((h) => h.position !== coord);
  const cities = p.world.cities.concat([new City(coord)]);
  const players = r.world.players.map(
    (pl) => (pl.id === p.world.id ? { ...p.world, houses, cities } : pl),
  );
  return success({ ...r.world, players });
};

const placeRoad = (start: MatrixCoordinate, end: MatrixCoordinate) => (
  p: Result<Player>,
) => (r: Result<World>) => {
  if (r.tag === 'Failure') {
    return r;
  }
  if (p.tag === 'Failure') {
    return p;
  }
  const canPlace = p.world.roads.some(
    (ro) => ro.start !== start && ro.end !== end,
  );
  if (!canPlace) {
    return fail('Cannot place a road here!');
  }
  const roads = p.world.roads.concat([new Road(start, end)]);
  const players = r.world.players.map(
    (pl) => (pl.id === p.world.id ? { ...p.world, roads } : pl),
  );
  return success({ ...r.world, players });
};
