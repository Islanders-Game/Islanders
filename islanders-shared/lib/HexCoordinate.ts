import type { MatrixCoordinate } from './Shared';

export interface HexCoordinate {
  x: number;
  y: number;
}

export const hexEquals = (hex1: HexCoordinate, hex2: HexCoordinate) => {
  return hex1.x === hex2.x && hex1.y === hex2.y;
};

export const getNeighbouringHexCoords = (coord: HexCoordinate): HexCoordinate[] => {
  let result = [
    {
      x: coord.x,
      y: coord.y - 1,
    },
    {
      x: coord.x,
      y: coord.y + 1,
    },
    {
      x: coord.x - 1,
      y: coord.y,
    },
    {
      x: coord.x + 1,
      y: coord.y,
    },
  ];
  if (coord.x % 2 === 0) {
    result = result.concat([
      {
        x: coord.x - 1,
        y: coord.y - 1,
      },
      {
        x: coord.x + 1,
        y: coord.y - 1,
      },
    ]);
  } else {
    result = result.concat([
      {
        x: coord.x - 1,
        y: coord.y + 1,
      },
      {
        x: coord.x + 1,
        y: coord.y + 1,
      },
    ]);
  }
  return result;
};

export const getNeighbouringMatrixCoords = (coord: HexCoordinate): MatrixCoordinate[] => {
  const matrixX = coord.x * 2;
  let matrixY = coord.y * 2 + 1;
  if (coord.x % 2 !== 0) {
    matrixY++;
  }
  // Return corners in honeycomb v4 order (starting from Northeast, going clockwise)
  return [
    {
      x: matrixX + 2,
      y: matrixY - 1,
    },
    {
      x: matrixX + 3,
      y: matrixY,
    },
    {
      x: matrixX + 2,
      y: matrixY + 1,
    },
    {
      x: matrixX + 1,
      y: matrixY + 1,
    },
    {
      x: matrixX,
      y: matrixY,
    },
    {
      x: matrixX + 1,
      y: matrixY - 1,
    },
  ];
};

export const getMatrixCoordCorner = (coord: HexCoordinate, cornerIndex: number): MatrixCoordinate => {
  const matrixX = coord.x * 2;
  let matrixY = coord.y * 2 + 1;
  if (coord.x % 2 !== 0) {
    matrixY++;
  }
  // Honeycomb v4 corners for FLAT orientation:
  // 0: Northeast (top-right)
  // 1: East (right)
  // 2: Southeast (bottom-right)
  // 3: Southwest (bottom-left)
  // 4: West (left)
  // 5: Northwest (top-left)
  switch (cornerIndex) {
    case 0:
      return {
        x: matrixX + 2,
        y: matrixY - 1,
      };
    case 1:
      return {
        x: matrixX + 3,
        y: matrixY,
      };
    case 2:
      return {
        x: matrixX + 2,
        y: matrixY + 1,
      };
    case 3:
      return {
        x: matrixX + 1,
        y: matrixY + 1,
      };
    case 4:
      return {
        x: matrixX,
        y: matrixY,
      };
    case 5:
      return {
        x: matrixX + 1,
        y: matrixY - 1,
      };
    default:
      throw Error('Corner index out of bounds');
  }
};
