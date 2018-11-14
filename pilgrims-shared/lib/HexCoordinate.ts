import { MatrixCoordinate } from './Shared';

export interface HexCoordinate {
  x: number;
  y: number;
}

export const getNeighbouringHexCoords = (
  coord: HexCoordinate,
): HexCoordinate[] => {
  let result = [
    { x: coord.x, y: coord.y - 1 },
    { x: coord.x, y: coord.y + 1 },
    { x: coord.x - 1, y: coord.y },
    { x: coord.x + 1, y: coord.y },
  ];
  if (coord.x % 2 === 0) {
    result = result.concat([
      { x: coord.x - 1, y: coord.y - 1 },
      { x: coord.x + 1, y: coord.y - 1 },
    ]);
  } else {
    result = result.concat([
      { x: coord.x - 1, y: coord.y + 1 },
      { x: coord.x + 1, y: coord.y + 1 },
    ]);
  }
  return result;
};

export const getNeighbouringMatrixCoords = (
  coord: HexCoordinate,
): MatrixCoordinate[] => {
  const matrixX = coord.x * 2;
  let matrixY = coord.y * 2 + 1;
  if (coord.x % 2 !== 0) matrixY++;
  return [
    { x: matrixX + 3, y: matrixY },
    { x: matrixX + 2, y: matrixY + 1 },
    { x: matrixX + 1, y: matrixY + 1 },
    { x: matrixX, y: matrixY },
    { x: matrixX + 1, y: matrixY - 1 },
    { x: matrixX + 2, y: matrixY - 1 },
  ];
};

export const getMatrixCoordCorner = (
  coord: HexCoordinate,
  cornerIndex: number,
): MatrixCoordinate => {
  const matrixX = coord.x * 2;
  let matrixY = coord.y * 2 + 1;
  if (coord.x % 2 !== 0) matrixY++;
  switch (cornerIndex) {
    case 0:
      return { x: matrixX + 3, y: matrixY };
    case 1:
      return { x: matrixX + 2, y: matrixY + 1 };
    case 2:
      return { x: matrixX + 1, y: matrixY + 1 };
    case 3:
      return { x: matrixX, y: matrixY };
    case 4:
      return { x: matrixX + 1, y: matrixY - 1 };
    case 5:
      return { x: matrixX + 2, y: matrixY - 1 };
    default:
      throw Error('Corner index out of bounds');
  }
};
