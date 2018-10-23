import { MatrixCoordinate } from './Shared';

export interface HexCoordinate {
  x: number;
  y: number;
}

export const getNeighbouringMatrixCoords = (
  coord: HexCoordinate,
): MatrixCoordinate[] => {
  let result: MatrixCoordinate[] = [];
  const matrixX = coord.x * 2;
  let matrixY = coord.y * 2;
  if (coord.x % 2 === 0) matrixY++;
  else matrixY = matrixY + 2;
  result.push({ x: matrixX + 3, y: matrixY });
  result.push({ x: matrixX + 2, y: matrixY - 1 });
  result.push({ x: matrixX + 1, y: matrixY - 1 });
  result.push({ x: matrixX, y: matrixY });
  result.push({ x: matrixX + 1, y: matrixY - 1 });
  result.push({ x: matrixX + 2, y: matrixY - 1 });
  return result;
};

export const getMatrixCoordCorner = (
  coord: HexCoordinate,
  cornerIndex: number,
): MatrixCoordinate => {
  const matrixX = coord.x * 2;
  let matrixY = coord.y * 2;
  if (coord.x % 2 === 0) matrixY++;
  else matrixY = matrixY + 2;
  switch (cornerIndex) {
    case 0:
      return { x: matrixX + 3, y: matrixY };
    case 1:
      return { x: matrixX + 2, y: matrixY - 1 };
    case 2:
      return { x: matrixX + 1, y: matrixY - 1 };
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
