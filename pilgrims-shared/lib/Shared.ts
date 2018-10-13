export interface Turn {
    player: number;
    actions: Action[];
}

export interface Action {
    buildHouse: undefined | { playerID: number, coordinates: MatrixCoordinate };
    buildCity:  undefined | { playerID: number, coordinates: MatrixCoordinate };
    buildRoad:  undefined | { playerID: number, start: MatrixCoordinate, end: MatrixCoordinate };
    moveThief:  undefined | { playerID: number, coordinates: HexCoordinate };
    buyCard:    undefined | { playerID: number };
    playCard:   undefined | { playerID: number, card: DevelopmentCard };
    trade:      undefined | { playerID: number, otherPlayerID: number, resources: Resources };
}

export interface World {
    players: Player[];
    thief?: Thief;
    map: Tile[];
}

export interface Thief {
    hexCoordinate: HexCoordinate;
}

export interface Player {
    id: number;
    resources: Resources;
    houses: House[];
    cities: City[];
    roads: Road[];
    ships: Ship[];
}

interface Purchaseable { cost: Resources; }
export class House implements Purchaseable {
    public position: MatrixCoordinate;
    public cost = {
        wood: 1,
        clay: 1,
        wool: 1,
        grain: 1,
    };

    constructor(coordinates: MatrixCoordinate = {x: 0, y: 0}) {
        this.position = coordinates;
    }
}

export class City extends House {
    public cost = {
        grain: 2,
        stone: 3,
        wool: 0,
        wood: 0,
        clay: 0
    };
}

export class Road implements Purchaseable {
    public start: MatrixCoordinate;
    public end: MatrixCoordinate;
    public cost = {
        wood: 1,
        clay: 1,
    };

    constructor(start: MatrixCoordinate = {x: 0, y: 0}, end: MatrixCoordinate = {x: 0, y: 0}) {
        this.start = start;
        this.end = end;
    }
}

export class Ship extends Road {
    public cost = {
        wood: 1,
        wool: 1,
        clay: 0
    };
}

export class DevelopmentCard implements Purchaseable {
    public type: 'Knight' | 'Victory Point' | 'Road Building' | 'Monopoly' | 'Year of Plenty' | 'None' = 'None';
    public cost = {
        grain: 1,
        stone: 1,
        wool: 1,
    };
}

export interface Tile {
    type: 'Wood' | 'Stone' | 'Clay' | 'Grain' | 'Wool' | 'Desert' | 'Ocean';
    diceRoll: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

export interface HexCoordinate {
    x: number;
    y: number;
}
export interface MatrixCoordinate extends HexCoordinate {}

export interface Resources {
    wood?: number;
    stone?: number;
    clay?: number;
    grain?: number;
    wool?: number;
}

export interface ChatMessage {
    text: string;
    user: string;
}

export interface Failure {
    tag: 'Failure';
    reason: string;
}
export interface Success<T> {
    tag: 'Success';
    world: T;
}
export type Result<T> = Success<T> | Failure;

export type Rule = (w: Result<World>) => Result<World>;
export interface Rules {
    'Build House':  (playerID: number, coordinates: MatrixCoordinate) => (w: Result<World>) => Result<World>;
    'Build City':   (playerID: number, coordinates: MatrixCoordinate) => (w: Result<World>) => Result<World>;
    'Build Road':   (playerID: number, start: MatrixCoordinate, end: MatrixCoordinate)
        => (w: Result<World>) => Result<World>;
    'Move Thief':   (playerID: number, coordinates: HexCoordinate) => (w: Result<World>) => Result<World>;
    'Buy Card':     (playerID: number) => (w: Result<World>) => Result<World>;
    'Play Card':    (playerID: number, card: DevelopmentCard) => (w: Result<World>) => Result<World>;
    'Trade':        (playerID: number, otherPlayerID: number, resources: Resources) => (w: Result<World>) => Result<World>;
}

export const ruleReducer = (acc: Result<World>, curr: ((x: Result<World>) => (Result<World>))) => curr(acc);

//
// ---- Rule implementations ----
//
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