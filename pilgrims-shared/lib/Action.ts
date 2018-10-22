import { MatrixCoordinate } from './MatrixCoordinate';
import { HexCoordinate } from './HexCoordinate';
import { DevelopmentCard } from './Entities/DevelopmentCard';
import { Resources } from './Resources';

interface HasPlayerID {
  playerID: string;
}
interface BuildHouseParameters extends HasPlayerID {
  coordinates: MatrixCoordinate;
}
interface BuildCityParameters extends HasPlayerID {
  coordinates: MatrixCoordinate;
}
interface BuildRoadParameters extends HasPlayerID {
  start: MatrixCoordinate;
  end: MatrixCoordinate;
}
interface PlaceThiefParameters extends HasPlayerID {
  coordinates: HexCoordinate;
}
interface TradeParameters extends HasPlayerID {
  otherPlayerID: string;
  resources: Resources;
}
interface PlayCardParameters extends HasPlayerID {
  card: DevelopmentCard;
}
interface BuyCardParameters extends HasPlayerID {
  card: DevelopmentCard;
}

export class BuildHouseAction {
  public type: 'buildHouse' = 'buildHouse';
  public parameters: BuildHouseParameters;
  constructor(playerID: string, coordinates: MatrixCoordinate) {
    this.parameters = { playerID, coordinates };
  }
}

export class BuildCityAction {
  public type: 'buildCity' = 'buildCity';
  public parameters: BuildCityParameters;
  constructor(playerID: string, coordinates: MatrixCoordinate) {
    this.parameters = { playerID: playerID, coordinates: coordinates };
  }
}

export class BuildRoadAction {
  public type: 'buildRoad' = 'buildRoad';
  public parameters: BuildRoadParameters;
  constructor(
    playerID: string,
    start: MatrixCoordinate,
    end: MatrixCoordinate,
  ) {
    this.parameters = { playerID, start, end };
  }
}

export class PlaceThiefAction {
  public type: 'placeThief' = 'placeThief';
  public parameters: PlaceThiefParameters;
  constructor(playerID: string, coordinates: HexCoordinate) {
    this.parameters = { playerID, coordinates };
  }
}

export class TradeAction {
  public type: 'trade' = 'trade';
  public parameters: TradeParameters;
  constructor(playerID: string, otherPlayerID: string, resources: Resources) {
    this.parameters = { playerID, otherPlayerID, resources };
  }
}

export class BuyCardAction {
  public type: 'buyCard' = 'buyCard';
  public parameters: BuyCardParameters;
  constructor(playerID: string, card: DevelopmentCard) {
    this.parameters = { playerID, card };
  }
}

export class PlayCardAction {
  public type: 'playCard' = 'playCard';
  public parameters: PlayCardParameters;
  constructor(playerID: string, card: DevelopmentCard) {
    this.parameters = { playerID, card };
  }
}

// An action is an closure which has the information necessary to perform one rule on a world.
export type Action =
  | BuildHouseAction
  | BuildCityAction
  | BuildRoadAction
  | PlaceThiefAction
  | TradeAction
  | PlayCardAction
  | BuyCardAction;
