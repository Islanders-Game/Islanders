import { Rules, World, Resources, MatrixCoordinate, House, City, Road, Player, Failure,
    Success, Result, Action } from './Shared';

// ---- Rule implementations ----
export const rules: Rules = {
    'Build House': (id, coordinates) => (w) => {
        if (w.tag === 'Failure') { return w; }
        const player = findPlayer(id)(w);
        const purchased = purchase(new House().cost)(player)(w);
        const placed = placeHouse(coordinates)(player)(purchased);
        return placed;
    },
    'Build City': (id, coordinates) => (w) => {
        if (w.tag === 'Failure') { return w; }
        const player = findPlayer(id)(w);
        const purchased = purchase(new City().cost)(player)(w);
        return placeCity(coordinates)(player)(purchased);
    },
    'Build Road': (id, start, end) => (w) => {
        if (w.tag === 'Failure') { return w; }
        const player = findPlayer(id)(w);
        const purchased = purchase(new Road().cost)(player)(w);
        return placeRoad(start, end)(player)(purchased);
    },
    'Move Thief': (p, {x, y}) => (w) => w, // TODO: Implement rules.
    'Buy Card': (p) => (w) => w,
    'Play Card': (p, c) => (w) => w,
    'Trade': (p1, p2) => (w) => w,
};

// ---- Helpers ----
export const subtractResources = (resources: Resources, toSubtract: Resources) => {
    return {
        clay: resources.clay && toSubtract.clay ? resources.clay - toSubtract.clay : resources.clay,
        grain: resources.grain && toSubtract.grain ? resources.grain - toSubtract.grain : resources.grain,
        stone: resources.stone && toSubtract.stone ? resources.stone - toSubtract.stone : resources.stone,
        wood: resources.wood && toSubtract.wood ? resources.wood - toSubtract.wood : resources.wood,
        wool: resources.wool && toSubtract.wool ? resources.wool - toSubtract.wool : resources.wool,
    };
};

export const resourcesAreNonNegative = (resources: Resources) => {
    return resources.clay && resources.clay >= 0 &&
        resources.grain && resources.grain >= 0 &&
        resources.wood && resources.wood >= 0 &&
        resources.wool && resources.wool >= 0 &&
        resources.stone && resources.stone >= 0;
};

function fail(reason: string): Failure { return { tag: 'Failure', reason }; }
function success<T>(t: T): Success<T> { return { tag: 'Success', world: t }; }

export const purchase = (cost: Resources) => (p: Result<Player>) => (r: Result<World>) => {
    if (r.tag === 'Failure') { return r; }
    if (p.tag === 'Failure') { return p; }
    const resources = subtractResources(p.world.resources, cost);
    if (!resourcesAreNonNegative(resources)) { return fail(`Player ${p.world.id} cannot afford this.`); }
    const players = r.world.players.map((pl) => (pl.id === p.world.id) ? {...p.world, resources} : pl);
    return success({ ...r.world, players });
};

const findPlayer = (id: number) => (r: Result<World>) => {
    if (r.tag === 'Failure') { return r; }
    const player = r.world.players.find((pl) => pl.id === id);
    if (!player) { return fail(`Player ${id} not found.`); }
    return success(player);
};

const placeHouse = (coord: MatrixCoordinate) => (p: Result<Player>) => (r: Result<World>) => {
    if (r.tag === 'Failure') { return r; }
    if (p.tag === 'Failure') { return p; }
    const allHouses = r.world.players.reduce((acc: House[], p) => acc.concat(p.houses), []);
    const canPlace = allHouses.every((h) =>
        (h.position.x !== coord.x && h.position.y !== coord.y)
        && (h.position.y !== coord.y - 1 && h.position.x !== coord.x - 1)  // Adjecent matrix corners.
        && (h.position.y !== coord.y - 1 && h.position.x !== coord.x + 1)  // Adjecent matrix corners.
        && (h.position.y !== coord.y + 1 && h.position.x !== coord.x - 1)  // Adjecent matrix corners.
        && (h.position.y !== coord.y + 1 && h.position.x !== coord.x + 1));
    if (!canPlace) { return fail('Cannot place a house here!'); }
    const addedHouse = p.world.houses.concat([new House(coord)]);
    const players = r.world.players.map((pl) => (pl.id === p.world.id) ? {...p.world, houses: addedHouse} : pl);
    return success( {...r.world, players });
};

const placeCity = (coord: MatrixCoordinate) => (p: Result<Player>) => (r: Result<World>) => {
    if (r.tag === 'Failure') { return r; }
    if (p.tag === 'Failure') { return p; }
    const canPlace = p.world.houses.some((h) => h.position.x === coord.x && h.position.y === coord.y);
    if (!canPlace) { return fail('Cannot place a house here!'); }
    const houses = p.world.houses.filter((h) => h.position !== coord);
    const cities = p.world.cities.concat([new City(coord)]);
    const players = r.world.players.map((pl) => (pl.id === p.world.id) ? {...p.world, houses, cities} : pl);
    return success( {...r.world, players });
};

const placeRoad = (start: MatrixCoordinate, end: MatrixCoordinate) => (p: Result<Player>) => (r: Result<World>) => {
    if (r.tag === 'Failure') { return r; }
    if (p.tag === 'Failure') { return p; }
    const canPlace = p.world.roads.some((ro) => ro.start !== start && ro.end !== end);
    if (!canPlace) { return fail('Cannot place a road here!'); }
    const roads = p.world.roads.concat([new Road(start, end)]);
    const players = r.world.players.map((pl) => (pl.id === p.world.id) ? {...p.world, roads} : pl);
    return success( {...r.world, players });
};


// -----------------------
// Example usage of above:
// -----------------------
const initialWorld: World = {
    players: [{
        id: 0,
        resources: {},
        cities: [],
        houses: [],
        roads: [],
        ships: [],
    }],
    map: [{type: 'Wool', diceRoll: 12}],
};

const tryBuildHouse = rules['Build House'](2, {x: 2, y: 2});
const tryBuildCity = rules['Build City'](2, {x: 2, y: 2});
const toApply = [tryBuildHouse, tryBuildCity];

export const ruleReducer = (acc: Result<World>, curr: ((x: Result<World>) => (Result<World>))) => curr(acc);
const newWorld = toApply.reduce(ruleReducer, success(initialWorld));

if (newWorld.tag === 'Success') {
    // tslint:disable-next-line:no-console
    console.log('Successfully applied two actions/rules');
} else {
    // tslint:disable-next-line:no-console
    console.log(newWorld.reason);
}
