export interface World {
    players: Player[];
    thief?: Thief;
    map: Tile[];
}

export interface Thief {
    hexCoordinate: HexCoordinate
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
    position: MatrixCoordinate = {x: 0, y: 0};
    cost = {
        wood: 1,
        clay: 1,
        wool: 1,
        grain: 1
    };
}

export class Road implements Purchaseable {
    start: MatrixCoordinate = {x: 0, y: 0};
    end: MatrixCoordinate = {x: 0, y: 0};
    cost = {
        wood: 1,
        clay: 1
    };
}
export class Ship implements Purchaseable {
    start: MatrixCoordinate = {x: 0, y: 0};
    end: MatrixCoordinate = {x: 0, y: 0};
    cost = {
        wood: 1,
        wool: 1
    };
}

export class City implements Purchaseable {
    position: MatrixCoordinate = {x: 0, y: 0};
    cost = {
        grain: 2,
        stone: 3
    };
}

export class DevelopmentCard implements Purchaseable {
    type: "Knight" | "Victory Point" | "Road Building" | "Monopoly" | "Year of Plenty" | "None" = "None"
    cost = {
        grain: 1,
        stone: 1,
        wool: 1
    };
}

export interface Tile {
    type: "Wood" | "Stone" | "Clay" | "Grain" | "Wool";
    diceRoll: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

export interface HexCoordinate {
    x: number;
    y: number;
}
export interface MatrixCoordinate extends HexCoordinate {};

export interface Resources {
    wood?: number;
    stone?: number;
    clay?: number;
    grain?: number;
    wool?: number;
}

export class Failure {
    public reason: string; 
    constructor(t: string) { 
        this.reason = t
    }
}
export class Success<T> {
    public world: T;
    constructor(t: T) { 
        this.world = t
    }
}
export type Result<T> = Success<T> | Failure

export type Rules = {
    "Build House": (playerID: number, x:number, y:number) => (w:Result<World>) => Result<World>
    "Build City": (playerID: number, x:number, y:number) => (w:Result<World>) => Result<World>
    "Build Road": (playerID: number, x:number, y:number) => (w:Result<World>) => Result<World>
    "Move Thief": (playerID: number, x:number, y:number) => (w:Result<World>) => Result<World>
    "Buy Card": (playerID: number) => (w:Result<World>) => Result<World>
    "Play Card": (playerID: number, card: DevelopmentCard) => (w:Result<World>) => Result<World>
    "Trade": (playerID: number, otherPlayerID: number, resources: Resources) => (w:Result<World>) => Result<World>   
}
