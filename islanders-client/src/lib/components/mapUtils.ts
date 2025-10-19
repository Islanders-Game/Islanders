import {
	type World,
	getMatrixCoordCorner,
	type MatrixCoordinate,
	type Player
} from '../../../../islanders-shared/lib/Shared';
import { neighbouringHexCoords } from '../../../../islanders-shared/lib/MatrixCoordinate';

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

export type HexFactory = {
	new (coords: { col: number; row: number }): {
		col: number;
		row: number;
		x: number;
		y: number;
		width: number;
		height: number;
		corners: Array<{ x: number; y: number }>;
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

/**
 * Converts a matrix coordinate to actual world position using the honeycomb hex grid.
 * This ensures that rendered pieces align exactly with the hex grid's corner positions.
 *
 * @param matrixCoord - The matrix coordinate to convert
 * @param hexFactory - The honeycomb hex factory used to create hex instances
 * @returns The world coordinate position {x, y}
 */
export const matrixCoordToGridWorldCoord = (
	matrixCoord: MatrixCoordinate,
	hexFactory: HexFactory
): { x: number; y: number } => {
	// Reverse engineer which hex and corner this matrix coordinate represents
	// Matrix coordinates are denser than hex coordinates (multiple matrix coords per hex)
	// Approximate the hex coordinate from matrix coordinate
	const approxHexX = Math.floor(matrixCoord.x / 2);
	const approxHexY = Math.floor(matrixCoord.y / 2);

	// Check this hex and its neighbors to find which corner matches our matrix coordinate
	for (let dx = -1; dx <= 1; dx++) {
		for (let dy = -1; dy <= 1; dy++) {
			const hexX = approxHexX + dx;
			const hexY = approxHexY + dy;
			const testHex = new hexFactory({ col: hexX, row: hexY });

			// Check each corner of this hex
			for (let cornerIndex = 0; cornerIndex < 6; cornerIndex++) {
				const cornerMatrixCoord = getMatrixCoordCorner({ x: hexX, y: hexY }, cornerIndex);
				if (cornerMatrixCoord.x === matrixCoord.x && cornerMatrixCoord.y === matrixCoord.y) {
					// Found it! Return the actual world position of this corner
					const corners = testHex.corners;
					return { x: corners[cornerIndex].x, y: corners[cornerIndex].y };
				}
			}
		}
	}

	// Fallback to mathematical calculation if not found (shouldn't happen in normal operation)
	console.warn('Could not find hex corner for matrix coord:', matrixCoord);
	const originHex = new hexFactory({ col: 0, row: 0 });
	// Simple mathematical fallback calculation
	const worldX =
		(matrixCoord.x * originHex.width) / 4 + Math.floor(matrixCoord.x / 2) * (originHex.width / 4);
	const worldY = (matrixCoord.y * originHex.height) / 2;
	return { x: worldX, y: worldY };
};

/**
 * Gets the list of players who can be stolen from based on the thief's position.
 * A player can be stolen from if they have a settlement or city adjacent to the hex where the thief is located.
 *
 * @param world - The current game world state
 * @param currentPlayerName - The name of the current player (who cannot be stolen from themselves)
 * @returns Array of players who can be stolen from
 */
export const getStealablePlayers = (
	world: World,
	currentPlayerName: string | undefined
): Player[] => {
	if (!world.thief || !world.players) return [];

	const thiefHex = world.thief.hexCoordinate;
	console.log('Getting stealable players. Thief at:', thiefHex);
	const playersWithBuildings = new Set<string>();

	world.players.forEach((player) => {
		// Check houses
		player.houses.forEach((house) => {
			const houseHexes = neighbouringHexCoords(house.position);
			console.log(
				`Checking house for ${player.name} at:`,
				house.position,
				'adjacent hexes:',
				houseHexes
			);
			if (houseHexes.some((hex) => hex.x === thiefHex.x && hex.y === thiefHex.y)) {
				console.log(`Player ${player.name} has house adjacent to thief`);
				playersWithBuildings.add(player.name);
			}
		});

		// Check cities
		player.cities.forEach((city) => {
			const cityHexes = neighbouringHexCoords(city.position);
			console.log(
				`Checking city for ${player.name} at:`,
				city.position,
				'adjacent hexes:',
				cityHexes
			);
			if (cityHexes.some((hex) => hex.x === thiefHex.x && hex.y === thiefHex.y)) {
				console.log(`Player ${player.name} has city adjacent to thief`);
				playersWithBuildings.add(player.name);
			}
		});
	});

	const result = Array.from(playersWithBuildings)
		.map((name) => world.players.find((p) => p.name === name))
		.filter((p): p is Player => p !== undefined);

	console.log(
		'Stealable players:',
		result.map((p) => p.name)
	);
	return result;
};
