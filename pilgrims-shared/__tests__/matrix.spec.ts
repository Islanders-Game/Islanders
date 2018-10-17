import {
  MatrixCoordinate,
  neighbouringMatrixCoord,
  neighbouringHexCoord,
} from '../dist/Shared';

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
