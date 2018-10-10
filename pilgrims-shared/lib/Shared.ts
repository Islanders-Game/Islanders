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
    type: 'Wood' | 'Stone' | 'Clay' | 'Grain' | 'Wool' | 'Desert' | 'Sea';
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

export interface Failure {
    tag: 'Failure';
    reason: string;
}
export interface Success<T> {
    tag: 'Success';
    world: T;
}
export type Result<T> = Success<T> | Failure;

export interface Rules {
    'Build House': (playerID: number, coordinates: MatrixCoordinate) => (w: Result<World>) => Result<World>;
    'Build City': (playerID: number, coordinates: MatrixCoordinate) => (w: Result<World>) => Result<World>;
    'Build Road': (playerID: number, start: MatrixCoordinate, end: MatrixCoordinate)
        => (w: Result<World>) => Result<World>;
    'Move Thief': (playerID: number, coordinates: HexCoordinate) => (w: Result<World>) => Result<World>;
    'Buy Card': (playerID: number) => (w: Result<World>) => Result<World>;
    'Play Card': (playerID: number, card: DevelopmentCard) => (w: Result<World>) => Result<World>;
    'Trade': (playerID: number, otherPlayerID: number, resources: Resources) => (w: Result<World>) => Result<World>;
}
