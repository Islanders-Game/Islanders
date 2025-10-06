import type { Point } from 'pixi.js';
import type { World } from '../../../../islanders-shared/lib/Shared';

export type HexGrid = {
	pointToHex: (point: { x: number; y: number }) => {
		x: number;
		y: number;
		toPoint: () => { x: number; y: number };
		width: () => number;
		height: () => number;
		corners: () => Array<{ x: number; y: number }>;
		center: () => { x: number; y: number };
	};
};

type ClosestPoint = {
	point: { x: number; y: number };
	index: number;
	dist: number;
};

export function getClosestPoint(grid: HexGrid, point: Point): ClosestPoint {
	const distanceFunc = (from: { x: number; y: number }, to: { x: number; y: number }) =>
		Math.sqrt(Math.abs(from.x - to.x) ** 2 + Math.abs(from.y - to.y) ** 2);

	const hexToFind = grid.pointToHex(point);
	const hexOrigin = hexToFind.toPoint();
	const centerOfHex = {
		x: hexOrigin.x + hexToFind.width() / 2,
		y: hexOrigin.y + hexToFind.height() / 2
	};

	const distance = distanceFunc(point, centerOfHex);
	let closestPoint: ClosestPoint = { point: centerOfHex, index: -1, dist: distance };
	const corners = hexToFind.corners();
	for (let i = 0; i < corners.length; i += 1) {
		const corner = corners[i];
		corner.x += hexOrigin.x;
		corner.y += hexOrigin.y;
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
}

export function getTwoClosestPoints(grid: HexGrid, point: Point): [ClosestPoint, ClosestPoint] {
	const distanceFunc = (from: { x: number; y: number }, to: { x: number; y: number }) =>
		Math.sqrt(Math.abs(from.x - to.x) ** 2 + Math.abs(from.y - to.y) ** 2);
	const hexToFind = grid.pointToHex(point);
	const hexOrigin = hexToFind.toPoint();
	const corners = hexToFind.corners();
	const mapped = corners.map((c, index: number) => {
		const corner = c;
		corner.x += hexOrigin.x;
		corner.y += hexOrigin.y;
		const cornerDist = distanceFunc(point, corner);
		return {
			point: corner,
			index,
			dist: cornerDist
		};
	});

	const sorted = mapped.sort((first, second) => (first.dist > second.dist ? 1 : -1));
	return [sorted[0], sorted[1]];
}

export function compareWorlds(
	oldWorld: World | undefined,
	newWorld: World | undefined
): [boolean, boolean] {
	if (oldWorld === undefined || newWorld === undefined) {
		return [true, true];
	}

	const tilesChanged = oldWorld.map !== newWorld.map;
	const piecesChanged =
		!oldWorld.thief || oldWorld.thief !== newWorld.thief || oldWorld.players !== newWorld.players;

	return [tilesChanged, piecesChanged];
}
