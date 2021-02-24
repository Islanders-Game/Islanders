import {
  MatrixCoordinate,
  neighbouringMatrixCoords,
  neighbouringHexCoords,
  getMatrixCoordCorner,
  HexCoordinate,
} from '../lib/Shared';

describe('neighbouringMatrixCoords', () => {
  test.each([
    [{ x: 1, y: 0 }, [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 2, y: 0 }]],
    [{ x: 4, y: 1 }, [{ x: 3, y: 1 }, { x: 5, y: 0 }, { x: 5, y: 2 }]],
    [{ x: 3, y: 3 }, [{ x: 2, y: 2 }, { x: 2, y: 4 }, { x: 4, y: 3 }]],
  ])('Check correct output', (point, expected) => {
    const result = neighbouringMatrixCoords(<MatrixCoordinate>point);
    expect(result.length).toEqual((<Array<MatrixCoordinate>>expected).length);
    expect(result).toEqual(expect.arrayContaining((<Array<MatrixCoordinate>>expected)));
  });
});

describe('neighbouringHexCoord', () => {
  test.each([
    [{ x: 3, y: 1 }, [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }]],
    [{ x: 2, y: 2 }, [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }]],
    [{ x: 1, y: 2 }, [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }]],
    [{ x: 4, y: 1 }, [{ x: 1, y: -1 }, { x: 1, y: 0 }, { x: 2, y: 0 }]],
    [{ x: 5, y: 2 }, [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }]],
  ])('Check correct output', (point, expected) => {
    const result = neighbouringHexCoords(<MatrixCoordinate>point);
    expect(result.length).toEqual((<Array<MatrixCoordinate>>expected).length);
    expect(result).toEqual(expect.arrayContaining((<Array<MatrixCoordinate>>expected)));
  });
});

describe('getMatrixCoordCorner zeroCase', () => {
  test.each([
    [{ x: 0, y: 0 }, 3, { x: 0, y: 1 }],
    [{ x: 1, y: 0 }, 3, { x: 2, y: 2 }],
    [{ x: 0, y: 1 }, 3, { x: 0, y: 3 }],
    [{ x: 1, y: 1 }, 3, { x: 2, y: 4 }],
    [{ x: 2, y: 1 }, 3, { x: 4, y: 3 }],
    [{ x: 1, y: 2 }, 3, { x: 2, y: 6 }],
    [{ x: 2, y: 2 }, 3, { x: 4, y: 5 }],
  ])('Check correct output', (point, cornerIndex, expected) => {
    const result = getMatrixCoordCorner(<MatrixCoordinate>point, <number>cornerIndex);
    expect(result).toEqual(<MatrixCoordinate>expected);
  });
});

describe('Neighbouring HexCoordinates are found from MatrixCoordinates as expected', () => {
  const matrixCoordinateEven: MatrixCoordinate = { x: 6, y: 0 };
  const expectedHexesEven: HexCoordinate[] = [{ x: 2, y: 0 }, { x: 2, y: -1 }, { x: 3, y: -1 }];

  const matrixCoordinateOdd: MatrixCoordinate = { x: 7, y: -1 };
  const expectedHexesOdd: HexCoordinate[] = [{ x: 2, y: -1 }, { x: 3, y: -2 }, { x: 3, y: -1 }];

  const evenConverted = neighbouringHexCoords(matrixCoordinateEven);
  const oddConverted = neighbouringHexCoords(matrixCoordinateOdd);
  expect(evenConverted.every((converted) => expectedHexesEven.some((expected) => expected.x === converted.x && expected.y === converted.y)))
  expect(oddConverted.every((converted) => expectedHexesOdd.some((expected) => expected.x === converted.x && expected.y === converted.y)))
});