import type { World } from '../../../../islanders-shared/lib/Shared';

export type HexGrid = {
	pointToHex: (point: { x: number; y: number }) => {
		x: number; // center x coordinate
		y: number; // center y coordinate
		width: number;
		height: number;
		corners: Array<{ x: number; y: number }>;
		col: number;
		row: number;
	};
};

type ClosestPoint = {
	point: { x: number; y: number };
	index: number;
	dist: number;
};

export const getClosestPoint = (grid: HexGrid, point: { x: number; y: number }): ClosestPoint => {
	const distanceFunc = (from: { x: number; y: number }, to: { x: number; y: number }) =>
		Math.sqrt(Math.abs(from.x - to.x) ** 2 + Math.abs(from.y - to.y) ** 2);

	const hexToFind = grid.pointToHex(point);
	// In honeycomb v4, hex.x and hex.y are the center coordinates
	const centerOfHex = { x: hexToFind.x, y: hexToFind.y };

	const distance = distanceFunc(point, centerOfHex);
	let closestPoint: ClosestPoint = { point: centerOfHex, index: -1, dist: distance };
	const corners = hexToFind.corners;
	for (let i = 0; i < corners.length; i += 1) {
		const corner = corners[i];
		const cornerDist = distanceFunc(point, corner);
		if (closestPoint.dist > cornerDist) {
			closestPoint = {
				point: corners[i],
				index: i,
				dist: cornerDist
			};
		}
	}
	return closestPoint;
};

export const getTwoClosestPoints = (
	grid: HexGrid,
	point: { x: number; y: number }
): [ClosestPoint, ClosestPoint] => {
	const distanceFunc = (from: { x: number; y: number }, to: { x: number; y: number }) =>
		Math.sqrt(Math.abs(from.x - to.x) ** 2 + Math.abs(from.y - to.y) ** 2);
	const hexToFind = grid.pointToHex(point);
	const corners = hexToFind.corners;
	const mapped = corners.map((corner: { x: number; y: number }, index: number) => {
		const cornerDist = distanceFunc(point, corner);
		return {
			point: corner,
			index,
			dist: cornerDist
		};
	});

	const sorted = mapped.sort((first: ClosestPoint, second: ClosestPoint) =>
		first.dist > second.dist ? 1 : -1
	);
	return [sorted[0], sorted[1]];
};

export const compareWorlds = (
	oldWorld: World | undefined,
	newWorld: World | undefined
): [boolean, boolean] => {
	if (oldWorld === undefined || newWorld === undefined) {
		return [true, true];
	}

	const tilesChanged = oldWorld.map !== newWorld.map;
	const piecesChanged =
		!oldWorld.thief || oldWorld.thief !== newWorld.thief || oldWorld.players !== newWorld.players;

	return [tilesChanged, piecesChanged];
};
