import { MatrixCoordinate } from './MatrixCoordinate';
import { HexCoordinate } from './HexCoordinate';
import { DevelopmentCard } from './Entities/DevelopmentCard';
import { Resources } from './Resources';

export interface Action {
  buildHouse: undefined | { playerID: string; coordinates: MatrixCoordinate };
  buildCity: undefined | { playerID: string; coordinates: MatrixCoordinate };
  buildRoad:
    | undefined
    | { playerID: string; start: MatrixCoordinate; end: MatrixCoordinate };
  moveThief: undefined | { playerID: string; coordinates: HexCoordinate };
  buyCard: undefined | { playerID: string };
  playCard: undefined | { playerID: string; card: DevelopmentCard };
  trade:
    | undefined
    | { playerID: string; otherPlayerID: string; resources: Resources };
}
