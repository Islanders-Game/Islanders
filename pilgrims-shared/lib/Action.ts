import { MatrixCoordinate } from './MatrixCoordinate';
import { HexCoordinate } from './HexCoordinate';
import { DevelopmentCard } from './Entities/DevelopmentCard';
import { Resources } from './Resources';
import { TileType } from './Shared';

interface HasPlayerName {
  playerName: string;
}
interface BuildHouseParameters extends HasPlayerName {
  coordinates: MatrixCoordinate;
}
interface BuildCityParameters extends HasPlayerName {
  coordinates: MatrixCoordinate;
}
interface BuildRoadParameters extends HasPlayerName {
  start: MatrixCoordinate;
  end: MatrixCoordinate;
}
interface PlaceThiefParameters extends HasPlayerName {
  coordinates: HexCoordinate;
}
interface TradeParameters extends HasPlayerName {
  otherPlayerID: string;
  resources: Resources;
}
interface PlayCardParameters extends HasPlayerName {
  card: DevelopmentCard;
  chosenResources: TileType | [TileType, TileType];
}
interface BuyCardParameters extends HasPlayerName {}
interface EndTurnParameters extends HasPlayerName {}

export class BuildHouseAction {
  public type: 'buildHouse' = 'buildHouse';
  public parameters: BuildHouseParameters;
  constructor(playerName: string, coordinates: MatrixCoordinate) {
    this.parameters = { playerName, coordinates };
  }
}

export class BuildHouseInitialAction {
  public type: 'buildHouseInitial' = 'buildHouseInitial';
  public parameters: BuildHouseParameters;
  constructor(playerName: string, coordinates: MatrixCoordinate) {
    this.parameters = { playerName, coordinates };
  }
}

export class BuildCityAction {
  public type: 'buildCity' = 'buildCity';
  public parameters: BuildCityParameters;
  constructor(playerName: string, coordinates: MatrixCoordinate) {
    this.parameters = { playerName: playerName, coordinates: coordinates };
  }
}

export class BuildRoadAction {
  public type: 'buildRoad' = 'buildRoad';
  public parameters: BuildRoadParameters;
  constructor(
    playerName: string,
    start: MatrixCoordinate,
    end: MatrixCoordinate,
  ) {
    this.parameters = { playerName, start, end };
  }
}

export class BuildRoadInitialAction {
  public type: 'buildRoadInitial' = 'buildRoadInitial';
  public parameters: BuildRoadParameters;
  constructor(
    playerName: string,
    start: MatrixCoordinate,
    end: MatrixCoordinate,
  ) {
    this.parameters = { playerName, start, end };
  }
}

export class PlaceThiefAction {
  public type: 'placeThief' = 'placeThief';
  public parameters: PlaceThiefParameters;
  constructor(playerName: string, coordinates: HexCoordinate) {
    this.parameters = { playerName, coordinates };
  }
}

export class TradeAction {
  public type: 'trade' = 'trade';
  public parameters: TradeParameters;
  constructor(playerName: string, otherPlayerID: string, resources: Resources) {
    this.parameters = { playerName, otherPlayerID, resources };
  }
}

export class BuyCardAction {
  public type: 'buyCard' = 'buyCard';
  public parameters: BuyCardParameters;
  constructor(playerName: string) {
    this.parameters = { playerName };
  }
}

export class PlayCardAction {
  public type: 'playCard' = 'playCard';
  public parameters: PlayCardParameters;
  constructor(
    playerName: string,
    card: DevelopmentCard,
    chosenResources: TileType | [TileType, TileType],
  ) {
    this.parameters = { playerName, card, chosenResources };
  }
}

export class StartGameAction {
  public type: 'startGame' = 'startGame';
}

export class LockMapAction {
  public type: 'lockMap' = 'lockMap';
}

export class EndTurnAction {
  public type: 'endTurn' = 'endTurn';
  public parameters: EndTurnParameters;
  constructor(playerName: string) {
    this.parameters = { playerName };
  }
}

// An action is an closure which has the information necessary to perform one rule on a world.
export type Action =
  | BuildHouseAction
  | BuildHouseInitialAction
  | BuildCityAction
  | BuildRoadAction
  | BuildRoadInitialAction
  | PlaceThiefAction
  | TradeAction
  | PlayCardAction
  | BuyCardAction
  | StartGameAction
  | LockMapAction
  | EndTurnAction;
