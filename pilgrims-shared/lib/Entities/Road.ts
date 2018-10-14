import { Purchaseable } from './Purchaseable';
import { MatrixCoordinate } from '../MatrixCoordinate';

export class Road implements Purchaseable {
  public start: MatrixCoordinate;
  public end: MatrixCoordinate;
  public cost = {
    wood: 1,
    clay: 1,
  };

  constructor(
    start: MatrixCoordinate = { x: 0, y: 0 },
    end: MatrixCoordinate = { x: 0, y: 0 },
  ) {
    this.start = start;
    this.end = end;
  }
}
