import { HexCoordinate } from './HexCoordinate';

export interface MatrixCoordinate extends HexCoordinate {}

export const neighbouringMatrixCoord = (
  coord: MatrixCoordinate,
): MatrixCoordinate[] => {
  const result: MatrixCoordinate[] = [];
  if (coord.y % 2 === 0) {
    if (coord.x % 4 === 1) {
      result.push({ x: coord.x - 1, y: coord.y - 1 });
      result.push({ x: coord.x - 1, y: coord.y + 1 });
      result.push({ x: coord.x + 1, y: coord.y });
    } else if (coord.x % 4 === 2) {
      result.push({ x: coord.x - 1, y: coord.y });
      result.push({ x: coord.x + 1, y: coord.y - 1 });
      result.push({ x: coord.x + 1, y: coord.y + 1 });
    }
  } else {
    if (coord.x % 4 === 0) {
      result.push({ x: coord.x - 1, y: coord.y });
      result.push({ x: coord.x + 1, y: coord.y - 1 });
      result.push({ x: coord.x + 1, y: coord.y + 1 });
    }
    if (coord.x % 4 === 3) {
      result.push({ x: coord.x - 1, y: coord.y - 1 });
      result.push({ x: coord.x - 1, y: coord.y + 1 });
      result.push({ x: coord.x + 1, y: coord.y });
    }
  }
  return result;
};

export const neighbouringHexCoord = (
  coord: MatrixCoordinate,
): HexCoordinate[] => {
  const result: HexCoordinate[] = [];
  const hexX = Math.floor(coord.x / 2);
  const hexY = Math.floor(coord.y / 2);

  if (coord.y % 2 === 0) {
    // one hexY two hexY-1
    if (coord.x % 4 === 1) {
      // one hexX, two hexX-1
      result.push({ x: hexX, y: hexY });
      result.push({ x: hexX, y: hexY - 1 });
      result.push({ x: hexX - 1, y: hexY - 1 });
    } else if (coord.x % 4 === 2) {
      // two hexX, one hexX-1
      result.push({ x: hexX - 1, y: hexY });
      result.push({ x: hexX - 1, y: hexY - 1 });
      result.push({ x: hexX, y: hexY - 1 });
    }
  } else { // if (coord.y % 2 === 1)
    // two hexY one hexY-1
    if (coord.x % 4 === 0) {
      // one hexX, two hexX-1
      result.push({ x: hexX - 1, y: hexY });
      result.push({ x: hexX - 1, y: hexY - 1 });
      result.push({ x: hexX, y: hexY });
    } else if (coord.x % 4 === 3) {
      // two hexX, one hexX-1
      result.push({ x: hexX, y: hexY });
      result.push({ x: hexX, y: hexY - 1 });
      result.push({ x: hexX - 1, y: hexY });
    }
  }
  return result;
};
