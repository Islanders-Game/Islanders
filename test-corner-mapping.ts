import * as honeycombGrid from 'honeycomb-grid';
const { defineHex, Orientation } = honeycombGrid;

// Recreate the getMatrixCoordCorner function
function getMatrixCoordCorner(coord: { x: number; y: number }, cornerIndex: number) {
  const matrixX = coord.x * 2;
  let matrixY = coord.y * 2 + 1;
  if (coord.x % 2 !== 0) {
    matrixY++;
  }
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
}

const hexSize = 200;
const Hex = defineHex({
  dimensions: hexSize,
  orientation: Orientation.FLAT
});

// Test hex at (0, 0)
const testHex = new Hex({ col: 0, row: 0 });
const corners = testHex.corners;

console.log('=== Honeycomb Grid Corner Layout (FLAT orientation) ===');
console.log('Y-axis: negative is UP, positive is DOWN');
console.log('X-axis: negative is LEFT, positive is RIGHT\n');

console.log('Hex center at (0, 0):');
corners.forEach((corner, index) => {
  const matrixCoord = getMatrixCoordCorner({ x: 0, y: 0 }, index);
  const direction = getVisualDirection(corner.x, corner.y);
  console.log(`Corner ${index}: World(${corner.x.toFixed(0)}, ${corner.y.toFixed(0)}) -> Matrix(${matrixCoord.x}, ${matrixCoord.y}) - ${direction}`);
});

function getVisualDirection(x: number, y: number): string {
  const threshold = 50;
  let desc = '';
  
  if (y < -threshold) desc += 'TOP';
  else if (y > threshold) desc += 'BOTTOM';
  else desc += 'MIDDLE';
  
  desc += '-';
  
  if (x < -threshold) desc += 'LEFT';
  else if (x > threshold) desc += 'RIGHT';
  else desc += 'CENTER';
  
  return desc;
}

console.log('\n=== Current Mapping (might be wrong) ===');
console.log('The current code assumes this corner indexing:');
console.log('  0 -> East (right)');
console.log('  1 -> Southeast (bottom-right)');
console.log('  2 -> Southwest (bottom-left)');
console.log('  3 -> West (left)');
console.log('  4 -> Northwest (top-left)');
console.log('  5 -> Northeast (top-right)');

console.log('\n=== Actual Honeycomb v4 Corner Indexing ===');
console.log('Based on the test above:');
console.log('  0 -> Northeast (top-right) at 60° angle');
console.log('  1 -> East (right) at 0°');
console.log('  2 -> Southeast (bottom-right) at 60°');
console.log('  3 -> Southwest (bottom-left) at 120°');
console.log('  4 -> West (left) at 180°');
console.log('  5 -> Northwest (top-left) at -120°');

console.log('\n=== The Problem ===');
console.log('The getMatrixCoordCorner function was written for honeycomb v3');
console.log('which had a DIFFERENT corner ordering than v4!');
console.log('\nIn honeycomb v3 (pointy-top), corners started at East (0°).');
console.log('In honeycomb v4 (flat orientation), corners start at Northeast (-60°).');
console.log('\nThis causes a rotation/offset in the corner mapping!');
