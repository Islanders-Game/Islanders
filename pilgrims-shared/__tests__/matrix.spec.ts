import {
  MatrixCoordinate,
  neighbouringMatrixCoord,
  neighbouringHexCoord,
} from '../lib/Shared';

describe('neighbouringMatrixCoord', () => {
  test('Check correct output', () => {
    const point = { x: 1, y: 0 };
    const expected = [{ x: 0, y: 1 }, { x: 2, y: 0 }, { x: 0, y: -1 }];
    const result = neighbouringMatrixCoord(point);
    expect(result.length).toEqual(expected.length);

    result.forEach((element) => {
      expect(true).toEqual(
        expected.some(({ x, y }) => element.x == x && element.y == y),
      );
    });
  });
});

describe('neighbouringHexCoord', () => {
  test('Check correct output { x: 3, y: 1 }', () => {
    const point = { x: 3, y: 1 };
    const expected = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }];
    const result = neighbouringHexCoord(point);
    expect(result.length).toEqual(expected.length);
    expect(result).toEqual(expect.arrayContaining(expected));
  });
  test('Check correct output { x: 2, y: 2 }', () => {
    const point = { x: 2, y: 2 };
    const expected = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }];
    const result = neighbouringHexCoord(point);
    expect(result.length).toEqual(expected.length);
    expect(result).toEqual(expect.arrayContaining(expected));
  });
  test('Check correct output { x: 1, y: 2 }', () => {
    const point = { x: 1, y: 2 };
    const expected = [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }];
    const result = neighbouringHexCoord(point);
    expect(result.length).toEqual(expected.length);
    expect(result).toEqual(expect.arrayContaining(expected));
  });
  test('Check correct output { x: 4, y: 1 }', () => {
    const point = { x: 4, y: 1 };
    const expected = [{ x: 1, y: -1 }, { x: 1, y: 0 }, { x: 2, y: 0 }];
    const result = neighbouringHexCoord(point);
    expect(result.length).toEqual(expected.length);
    expect(result).toEqual(expect.arrayContaining(expected));
  });
  test('Check correct output { x: 5, y: 2 }', () => {
    const point = { x: 5, y: 2 };
    const expected = [{ x: 1, y: 1 }, { x: 1, y: 0 }, { x: 2, y: 0 }];
    const result = neighbouringHexCoord(point);
    expect(result.length).toEqual(expected.length);
    expect(result).toEqual(expect.arrayContaining(expected));
  });
});
