import * as honeycombGrid from 'honeycomb-grid';
const { defineHex, Grid, Orientation } = honeycombGrid;

// Create a hex grid similar to the game
const hexSize = 200;
const Hex = defineHex({
  dimensions: hexSize,
  orientation: Orientation.FLAT
});

// Create a test hex at position (0, 0)
const testHex = new Hex({ col: 0, row: 0 });

console.log('Test Hex at (col=0, row=0):');
console.log('Center:', { x: testHex.x, y: testHex.y });
console.log('Width:', testHex.width);
console.log('Height:', testHex.height);
console.log('\nCorners (with indices):');

const corners = testHex.corners;
corners.forEach((corner, index) => {
  console.log(`  Corner ${index}: { x: ${corner.x.toFixed(2)}, y: ${corner.y.toFixed(2)} }`);
});

// Determine the angular position of each corner
console.log('\nCorner angles (from center):');
corners.forEach((corner, index) => {
  const angle = Math.atan2(corner.y - testHex.y, corner.x - testHex.x) * 180 / Math.PI;
  console.log(`  Corner ${index}: ${angle.toFixed(2)}° (${getDirection(angle)})`);
});

function getDirection(angle: number): string {
  // Normalize angle to 0-360
  const normalized = ((angle + 360) % 360);
  
  if (normalized >= 345 || normalized < 15) return 'East (Right)';
  if (normalized >= 15 && normalized < 75) return 'Southeast';
  if (normalized >= 75 && normalized < 105) return 'South (Bottom)';
  if (normalized >= 105 && normalized < 165) return 'Southwest';
  if (normalized >= 165 && normalized < 195) return 'West (Left)';
  if (normalized >= 195 && normalized < 255) return 'Northwest';
  if (normalized >= 255 && normalized < 285) return 'North (Top)';
  if (normalized >= 285 && normalized < 345) return 'Northeast';
  return 'Unknown';
}

// Expected flat-top hex corners (counter-clockwise from East):
// For FLAT orientation:
// 0: East (right)
// 1: Southeast (bottom-right)
// 2: Southwest (bottom-left)
// 3: West (left)
// 4: Northwest (top-left)
// 5: Northeast (top-right)

console.log('\n=== Expected Catan Coordinate Mapping ===');
console.log('For a house at the top of a hex, adjacent roads should connect to:');
console.log('  - Top-left corner (typically index 4)');
console.log('  - Top-right corner (typically index 5)');
