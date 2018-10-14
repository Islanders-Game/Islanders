import { Purchaseable } from './Purchaseable';
import { MatrixCoordinate } from '../MatrixCoordinate';

export class House implements Purchaseable {
  public position: MatrixCoordinate;
  public cost = {
    wood: 1,
    clay: 1,
    wool: 1,
    grain: 1,
  };

  constructor(coordinates: MatrixCoordinate = { x: 0, y: 0 }) {
    this.position = coordinates;
  }
}
