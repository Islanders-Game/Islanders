import { MatrixCoordinate } from './MatrixCoordinate';
import { HexCoordinate } from './HexCoordinate';
import { DevelopmentCard } from './Entities/DevelopmentCard';
import { Resources } from './Resources';
import { Hex } from 'honeycomb-grid';

// An action is an closure which has the information neccesary to perform one rule on a world.

export type ActionString =
  | 'BuildHouse'
  | 'BuildCity'
  | 'BuildRoad'
  | 'Thief'
  | '';
export interface Action {
  type: ActionString;
  parameters: any;
}

type BuildHouseParameters = { playerID: string; coordinates: MatrixCoordinate };
type BuildCityParameters = { playerID: string; coordinates: MatrixCoordinate };
type BuildRoadParameters = {
  playerID: string;
  start: MatrixCoordinate;
  end: MatrixCoordinate;
};
type PlaceThiefParameters = { playerID: string; coord: HexCoordinate };

export class BuildHouseAction implements Action {
  public type: ActionString = 'BuildHouse';
  public parameters: BuildHouseParameters;
  constructor(playerID: string, coordinates: MatrixCoordinate) {
    this.parameters = { playerID: playerID, coordinates: coordinates };
  }
}

export class BuildCityAction implements Action {
  public type: ActionString = 'BuildCity';
  public parameters: BuildCityParameters;
  constructor(
    playerID: string,
    start: MatrixCoordinate,
    end: MatrixCoordinate,
  ) {
    this.parameters = { playerID: playerID, start: start, end: end };
  }
}

export class BuildRoadAction implements Action {
  public type: ActionString = 'BuildRoad';
  public parameters: BuildRoadAction;
  constructor(playerID: string, coordinates: MatrixCoordinate) {
    this.parameters = { playerID: playerID, coordinates: coordinates };
  }
}

export class ThiefAction implements Action {
  public type: ActionString = 'Thief';
  public parameters: PlaceThiefParameters;
  constructor(playerID: string, coordinates: HexCoordinate) {
    this.parameters = { playerID: playerID, coordinates: coordinates };
  }
}
