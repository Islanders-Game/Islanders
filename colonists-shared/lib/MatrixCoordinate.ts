import { HexCoordinate } from './HexCoordinate';

export type MatrixCoordinate = HexCoordinate

// Because of decisions, we have to deal with this hex->matrix mapping:
// 0 1 | 2 3 | 4 5 | 6 7
// . ._|_. . | . ._|_. .
// ./. | .\._|_./. | .\.
// .\._|_./. | .\._|_./.
// ./. | .\._|_./. | .\.
//
// . = MatrixCoordinates
export const matrixCoordToWorldCoord = (
  coord: MatrixCoordinate,
  width: number,
  height: number,
): { x: number; y: number } => {
  const worldX = (coord.x * width) / 4 + Math.floor(coord.x / 2) * (width / 4);
  const worldY = (coord.y * height) / 2;
  return { x: worldX, y: worldY };
};

const mod = (n: number, m: number) => {
  return ((n % m) + m) % m;
};

export const neighbouringMatrixCoords = (
  coord: MatrixCoordinate,
): MatrixCoordinate[] => {
  const result: MatrixCoordinate[] = [];
  if (mod(coord.y, 2) === 0) {
    if (mod(coord.x, 4) === 1) {
      result.push({ x: coord.x - 1, y: coord.y - 1 });
      result.push({ x: coord.x - 1, y: coord.y + 1 });
      result.push({ x: coord.x + 1, y: coord.y });
    } else if (mod(coord.x, 4) === 2) {
      result.push({ x: coord.x - 1, y: coord.y });
      result.push({ x: coord.x + 1, y: coord.y - 1 });
      result.push({ x: coord.x + 1, y: coord.y + 1 });
    }
  } else {
    if (mod(coord.x, 4) === 0) {
      result.push({ x: coord.x - 1, y: coord.y });
      result.push({ x: coord.x + 1, y: coord.y - 1 });
      result.push({ x: coord.x + 1, y: coord.y + 1 });
    }
    if (mod(coord.x, 4) === 3) {
      result.push({ x: coord.x - 1, y: coord.y - 1 });
      result.push({ x: coord.x - 1, y: coord.y + 1 });
      result.push({ x: coord.x + 1, y: coord.y });
    }
  }
  return result;
};

export const neighbouringHexCoords = (
  coord: MatrixCoordinate,
): HexCoordinate[] => {
  const result: HexCoordinate[] = [];
  const hexX = Math.floor(coord.x / 2);
  const hexY = Math.floor(coord.y / 2);

  if (mod(coord.y, 2) === 0) {
    // one hexY two hexY-1
    if (mod(coord.x, 4) === 1) {
      // one hexX, two hexX-1
      result.push({ x: hexX, y: hexY });
      result.push({ x: hexX, y: hexY - 1 });
      result.push({ x: hexX - 1, y: hexY - 1 });
    } else if (mod(coord.x, 4) === 2) {
      // two hexX, one hexX-1
      result.push({ x: hexX - 1, y: hexY });
      result.push({ x: hexX - 1, y: hexY - 1 });
      result.push({ x: hexX, y: hexY - 1 });
    }
  } else {
    // if (coord.y % 2 === 1)
    // two hexY one hexY-1
    if (mod(coord.x, 4) === 0) {
      // one hexX, two hexX-1
      result.push({ x: hexX - 1, y: hexY });
      result.push({ x: hexX - 1, y: hexY - 1 });
      result.push({ x: hexX, y: hexY });
    } else if (mod(coord.x, 4) === 3) {
      // two hexX, one hexX-1
      result.push({ x: hexX, y: hexY });
      result.push({ x: hexX, y: hexY - 1 });
      result.push({ x: hexX - 1, y: hexY });
    }
  }
  return result;
};
