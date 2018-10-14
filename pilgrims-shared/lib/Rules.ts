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

export type Rule = (w: Result<World>) => Result<World>;
export interface Rules {
  BuildHouse: (
    playerID: number,
    coordinates: MatrixCoordinate,
  ) => (w: Result<World>) => Result<World>;
  BuildCity: (
    playerID: number,
    coordinates: MatrixCoordinate,
  ) => (w: Result<World>) => Result<World>;
  BuildRoad: (
    playerID: number,
    start: MatrixCoordinate,
    end: MatrixCoordinate,
  ) => (w: Result<World>) => Result<World>;
  MoveThief: (
    playerID: number,
    coordinates: HexCoordinate,
  ) => (w: Result<World>) => Result<World>;
  BuyCard: (playerID: number) => (w: Result<World>) => Result<World>;
  PlayCard: (
    playerID: number,
    card: DevelopmentCard,
  ) => (w: Result<World>) => Result<World>;
  Trade: (
    playerID: number,
    otherPlayerID: number,
    resources: Resources,
  ) => (w: Result<World>) => Result<World>;
}

export const ruleReducer = (
  acc: Result<World>,
  curr: ((x: Result<World>) => Result<World>),
) => curr(acc);

//
// ---- Rule implementations ----
//
export const rules: Rules = {
  BuildHouse: (id, coordinates) => (w) => {
    if (w.tag === 'Failure') {
      return w;
    }
    const player = findPlayer(id)(w);
    const purchased = purchase(new House().cost)(player)(w);
    const placed = placeHouse(coordinates)(player)(purchased);
    return placed;
  },
  BuildCity: (id, coordinates) => (w) => {
    if (w.tag === 'Failure') {
      return w;
    }
    const player = findPlayer(id)(w);
    const purchased = purchase(new City().cost)(player)(w);
    return placeCity(coordinates)(player)(purchased);
  },
  BuildRoad: (id, start, end) => (w) => {
    if (w.tag === 'Failure') {
      return w;
    }
    const player = findPlayer(id)(w);
    const purchased = purchase(new Road().cost)(player)(w);
    return placeRoad(start, end)(player)(purchased);
  },
  MoveThief: (p, { x, y }) => (w) => w, // TODO: Implement rules.
  BuyCard: (p) => (w) => w,
  PlayCard: (p, c) => (w) => w,
  Trade: (p1, p2) => (w) => w,
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

const findPlayer = (id: number) => (r: Result<World>) => {
  if (r.tag === 'Failure') {
    return r;
  }
  const player = r.world.players.find((pl) => pl.id === id);
  if (!player) {
    return fail(`Player ${id} not found.`);
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
