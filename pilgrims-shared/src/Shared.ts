interface World {
    players: Player[];
    thief?: Thief;
    map: Tile[];
}

interface Thief {
    hexCoordinate: HexCoordinate
}

interface Player {
    resources: Resources;
    houses: House[];
    cities: City[];
    roads: Road[];
    ships: Ship[];
}

interface Purchaseable { cost: Resources; }
interface House extends Purchaseable {
    position: MatrixCoordinate;
    cost: {
        wood: 1,
        clay: 1,
        wool: 1,
        grain: 1
    };
}

interface Road extends Purchaseable {
    start: MatrixCoordinate;
    end: MatrixCoordinate;
    cost: {
        wood: 1,
        clay: 1
    };
}
interface Ship extends Purchaseable {
    start: MatrixCoordinate;
    end: MatrixCoordinate;
    cost: {
        wood: 1,
        wool: 1
    };
}

interface City extends Purchaseable {
    position: MatrixCoordinate;
    cost: {
        grain: 2,
        stone: 3
    };
}

interface DevelopmentCard extends Purchaseable {
    type: "Knight" | "Victory Point" | "Road Building" | "Monopoly" | "Year of Plenty"
    cost: {
        grain: 1,
        stone: 1,
        wool: 1
    };
}

interface Tile {
    type: "Wood" | "Stone" | "Clay" | "Grain" | "Wool";
    diceRoll: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

interface HexCoordinate {
    x: number;
    y: number;
}
interface MatrixCoordinate extends HexCoordinate {};

interface Resources {
    wood?: number;
    stone?: number;
    clay?: number;
    grain?: number;
    wool?: number;
}

type Rule = "Build House" | "Build City" | "Build Road" | "Move Thief" | "Buy Card" | "Play Card" | "Trade"

interface Failure<E> { tag: "Failure"; error: E; }
interface Success<T> { tag: "Success"; world: T; }
type Result<T, E> = Success<T> | Failure<E>;
type GameResult = Result<World, Error>
type GameAction = (world:World, type: Rule, ...params) => GameResult

type Rules = {
    "Build House": (x:number, y:number) => GameResult //MatrixCoordinate instead of x and y? Type reuse vs. extra brackets.
    "Build City": (x:number, y:number) => GameResult
    "Build Road": (start:number, end:number) => GameResult
    "Move Thief": (x:number, y:number) => GameResult
    "Buy Card": () => GameResult
    "Play Card": (card: DevelopmentCard) => GameResult
    "Trade": (resources: Resources) => GameResult
}

//Example:
const test = (a: GameResult) => {
    switch (a.tag) {
    case "Failure":
        return undefined;
    case "Success":
        const w = a.world;
        return w;
    }
}
    