interface World {
    players: Player[];
    thief?: Thief;
    map: Tile[];
}

interface Thief {
    hexCoordinate: HexCoordinate
}

interface Player {
    id: number;
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

interface Failure { tag: "Failure"; }
interface Success<T> { tag: "Success"; world: T; }
type Result<T> = Success<T> | Failure;
type GameResult = Result<World>

export type Rules = {
    "Build House": (playerID: number, x:number, y:number) => (w:World) => GameResult
    "Build City": (playerID: number, x:number, y:number) => (w:World) => GameResult
    "Build Road": (playerID: number, x:number, y:number) => (w:World) => GameResult
    "Move Thief": (playerID: number, x:number, y:number) => (w:World) => GameResult
    "Buy Card": (playerID: number) => (w:World) => GameResult
    "Play Card": (playerID: number, card: DevelopmentCard) => (w:World) => GameResult
    "Trade": (playerID: number, otherPlayerID: number, resources: Resources) => (w:World) => GameResult   
}
