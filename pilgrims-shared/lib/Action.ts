import { MatrixCoordinate } from './MatrixCoordinate';
import { HexCoordinate } from './HexCoordinate';
import { DevelopmentCard } from './Entities/DevelopmentCard';
import { Resources } from './Resources';

export interface Action {
  buildHouse: undefined | { playerID: number; coordinates: MatrixCoordinate };
  buildCity: undefined | { playerID: number; coordinates: MatrixCoordinate };
  buildRoad:
    | undefined
    | { playerID: number; start: MatrixCoordinate; end: MatrixCoordinate };
  moveThief: undefined | { playerID: number; coordinates: HexCoordinate };
  buyCard: undefined | { playerID: number };
  playCard: undefined | { playerID: number; card: DevelopmentCard };
  trade:
    | undefined
    | { playerID: number; otherPlayerID: number; resources: Resources };
}
