import { describe, expect, it } from 'vitest';
import * as honeycombGrid from 'honeycomb-grid';
const { defineHex, Grid, Orientation } = honeycombGrid;
import type { Point } from 'pixi.js';
import type { World } from '../../../../islanders-shared/lib/Shared';
import { compareWorlds, getClosestPoint, getTwoClosestPoints } from './mapUtils';

describe('mapUtils', () => {
	it('compareWorlds detects changes when old world is undefined', () => {
		const [tiles, pieces] = compareWorlds(undefined, {} as World);
		expect(tiles).toBe(true);
		expect(pieces).toBe(true);
	});

	it('compareWorlds detects tile changes', () => {
		const oldWorld = { map: [{ id: 1 }] } as unknown as World;
		const newWorld = { map: [{ id: 2 }] } as unknown as World;
		const [tiles] = compareWorlds(oldWorld, newWorld);
		expect(tiles).toBe(true);
	});

	it('compareWorlds detects piece changes', () => {
		const oldWorld = { map: [], players: [{ name: 'A' }], thief: undefined } as unknown as World;
		const thief = { hexCoordinate: { x: 0, y: 0 } };
		const newWorld = { map: [], players: [{ name: 'B' }], thief } as unknown as World;
		const [, pieces] = compareWorlds(oldWorld, newWorld);
		expect(pieces).toBe(true);
	});

	it('getClosestPoint returns center when point is in the middle of a hex', () => {
		const Hex = defineHex({ dimensions: 10, orientation: Orientation.FLAT });
		const grid = new Grid(Hex);
		const centerHex = new Hex({ col: 0, row: 0 });
		const center = centerHex.center;
		const closest = getClosestPoint(grid, center as unknown as Point);
		expect(closest.index).toBe(-1);
		expect(closest.dist).toBeCloseTo(0);
	});

	it('getTwoClosestPoints returns two corners in order of distance', () => {
		const Hex = defineHex({ dimensions: 10, orientation: Orientation.FLAT });
		const grid = new Grid(Hex);
		const hex = new Hex({ col: 0, row: 0 });
		const corner = hex.corners[0];

		const [first, second] = getTwoClosestPoints(grid, corner as unknown as Point);
		expect(first.index).toBeDefined();
		expect(second.index).toBeDefined();
		expect(first.dist).toBeLessThanOrEqual(second.dist);
	});
});
