export interface Turn {
    player: number;
    actions: Action[];
}
export interface Action {
    buildHouse: undefined | {
        playerID: number;
        coordinates: MatrixCoordinate;
    };
    buildCity: undefined | {
        playerID: number;
        coordinates: MatrixCoordinate;
    };
    buildRoad: undefined | {
        playerID: number;
        start: MatrixCoordinate;
        end: MatrixCoordinate;
    };
    moveThief: undefined | {
        playerID: number;
        coordinates: HexCoordinate;
    };
    buyCard: undefined | {
        playerID: number;
    };
    playCard: undefined | {
        playerID: number;
        card: DevelopmentCard;
    };
    trade: undefined | {
        playerID: number;
        otherPlayerID: number;
        resources: Resources;
    };
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
interface Purchaseable {
    cost: Resources;
}
export declare class House implements Purchaseable {
    position: MatrixCoordinate;
    cost: {
        wood: number;
        clay: number;
        wool: number;
        grain: number;
    };
    constructor(coordinates?: MatrixCoordinate);
}
export declare class City extends House {
    cost: {
        grain: number;
        stone: number;
        wool: number;
        wood: number;
        clay: number;
    };
}
export declare class Road implements Purchaseable {
    start: MatrixCoordinate;
    end: MatrixCoordinate;
    cost: {
        wood: number;
        clay: number;
    };
    constructor(start?: MatrixCoordinate, end?: MatrixCoordinate);
}
export declare class Ship extends Road {
    cost: {
        wood: number;
        wool: number;
        clay: number;
    };
}
export declare class DevelopmentCard implements Purchaseable {
    type: 'Knight' | 'Victory Point' | 'Road Building' | 'Monopoly' | 'Year of Plenty' | 'None';
    cost: {
        grain: number;
        stone: number;
        wool: number;
    };
}
export interface Tile {
    type: 'Wood' | 'Stone' | 'Clay' | 'Grain' | 'Wool' | 'Desert' | 'Ocean';
    diceRoll: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}
export interface HexCoordinate {
    x: number;
    y: number;
}
export interface MatrixCoordinate extends HexCoordinate {
}
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
export declare type Result<T> = Success<T> | Failure;
export declare type Rule = (w: Result<World>) => Result<World>;
export interface Rules {
    'Build House': (playerID: number, coordinates: MatrixCoordinate) => (w: Result<World>) => Result<World>;
    'Build City': (playerID: number, coordinates: MatrixCoordinate) => (w: Result<World>) => Result<World>;
    'Build Road': (playerID: number, start: MatrixCoordinate, end: MatrixCoordinate) => (w: Result<World>) => Result<World>;
    'Move Thief': (playerID: number, coordinates: HexCoordinate) => (w: Result<World>) => Result<World>;
    'Buy Card': (playerID: number) => (w: Result<World>) => Result<World>;
    'Play Card': (playerID: number, card: DevelopmentCard) => (w: Result<World>) => Result<World>;
    'Trade': (playerID: number, otherPlayerID: number, resources: Resources) => (w: Result<World>) => Result<World>;
}
export declare const ruleReducer: (acc: Result<World>, curr: (x: Result<World>) => Result<World>) => Result<World>;
export declare const rules: Rules;
export declare const subtractResources: (resources: Resources, toSubtract: Resources) => {
    clay: number | undefined;
    grain: number | undefined;
    stone: number | undefined;
    wood: number | undefined;
    wool: number | undefined;
};
export declare const resourcesAreNonNegative: (resources: Resources) => boolean | 0 | undefined;
export declare const purchase: (cost: Resources) => (p: Result<Player>) => (r: Result<World>) => Failure | Success<{
    players: Player[];
    thief?: Thief | undefined;
    map: Tile[];
}>;
export {};
