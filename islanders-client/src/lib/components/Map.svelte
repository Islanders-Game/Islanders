<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Application, Container, Graphics, Point } from 'pixi.js';
	import { Viewport } from 'pixi-viewport';
	import { extendHex, defineGrid } from 'honeycomb-grid';
	import { gameState, bindToWorld, sendAction } from '$lib/stores/game.svelte.ts';
	import {
		uiState,
		setIsBuilding,
		setIsMovingThief,
		setIsPlayingKnight,
		setIsStealingFromPlayers
	} from '$lib/stores/ui.svelte.ts';
	import type { BuildingType } from '$lib/stores/ui.svelte.ts';
	import {
		type World,
		type Player,
		getMatrixCoordCorner,
		matrixCoordToWorldCoord
	} from '../../../../islanders-shared/lib/Shared';
	import {
		BuildHouseAction,
		type Action as GameAction,
		BuildCityAction,
		BuildRoadAction,
		BuildHouseInitialAction,
		BuildRoadInitialAction,
		MoveThiefDevCardAction,
		MoveThiefAction
	} from '../../../../islanders-shared/lib/Action';
	import {
		generateSprites,
		generateTile,
		generateTileNumber,
		generateThiefTile
	} from '$lib/SpriteGenerators';
	import { compareWorlds, getClosestPoint, getTwoClosestPoints } from './mapUtils';

	let container: HTMLDivElement | undefined;

	const hexSize = 200;
	const tileHeight = 348;
	const tileWidth = 400;
	const lineWidth = 14;

	let app: Application | undefined;
	let viewport: Viewport | undefined;
	const tileGraphics = new Graphics();
	const pieceGraphics = new Graphics();
	const lineGraphics = new Graphics();
	const cursorGraphics = new Graphics();
	const sprites = generateSprites();

	let grid: any;
	let hexFactory: any;

	let height = 0;
	let width = 0;

	let currentPlayer: Player | undefined;
	let currentWorld: World | undefined;

	let isBuilding: BuildingType = 'None';
	let isMovingThief = false;
	let isPlayingKnight = false;
	let isPlayingRoadBuilding = false;

	let resizeObserver: ResizeObserver | undefined;
	let previousWorld: World | undefined;

	$effect(() => {
		const state = gameState;
		currentPlayer = state.playerName
			? state.world?.players.find((player) => player.name === state.playerName)
			: undefined;
		currentWorld = state.world;
		if (state.world !== previousWorld) {
			drawMap(state.world, previousWorld);
			previousWorld = state.world;
		}
	});

	$effect(() => {
		isBuilding = uiState.isBuilding;
		isMovingThief = uiState.isMovingThief;
		isPlayingKnight = uiState.isPlayingKnight;
		isPlayingRoadBuilding = uiState.isPlayingRoadBuilding;
	});

	const handleResize = () => {
		if (!container || !app || !viewport) {
			return;
		}

		height = container.clientHeight / (window.devicePixelRatio || 1);
		width = container.clientWidth / (window.devicePixelRatio || 1);
		app.renderer.resize(width, height);
		viewport.resize(width, height, width, height);
	};

	async function dispatchActionClearCursor(action: GameAction) {
		cursorGraphics.clear();
		cursorGraphics.removeChildren();
		try {
			await sendAction(action);
		} catch (error) {
			console.warn('Failed to send action', error);
		}
	}

	function handleThiefClick(event: { data: { global: Point } }) {
		if (!viewport || !grid) return;
		if (!currentPlayer) return;
		const inWorld = viewport.toWorld(event.data.global);
		const hexToFind = grid.pointToHex(inWorld);
		const moveThiefAction = new MoveThiefAction(currentPlayer.name, hexToFind);
		dispatchActionClearCursor(moveThiefAction);
		setIsMovingThief(false);
		setIsStealingFromPlayers(true);
	}

	function handleIsPlayingKnightClick(event: { data: { global: Point } }) {
		if (!viewport || !grid) return;
		if (!currentPlayer) return;
		const inWorld = viewport.toWorld(event.data.global);
		const hexToFind = grid.pointToHex(inWorld);
		const moveThiefAction = new MoveThiefDevCardAction(currentPlayer.name, hexToFind);
		dispatchActionClearCursor(moveThiefAction);
		setIsPlayingKnight(false);
		setIsStealingFromPlayers(true);
	}

	function handleBuildClick(event: { data: { global: Point } }) {
		if (!viewport || !currentPlayer || !currentWorld || !grid) return;

		const inWorld = viewport.toWorld(event.data.global);
		const closestPoints = getTwoClosestPoints(grid, inWorld);
		if (closestPoints[0].index === -1) {
			return;
		}
		const hexToFind = grid.pointToHex(inWorld);
		const coord = getMatrixCoordCorner(hexToFind, closestPoints[0].index);

		if (isBuilding === 'House') {
			const action =
				currentWorld.gameState === 'Started'
					? new BuildHouseAction(currentPlayer.name, coord)
					: new BuildHouseInitialAction(currentPlayer.name, coord);

			dispatchActionClearCursor(action);
			setIsBuilding('None');
		}
		if (isBuilding === 'City') {
			dispatchActionClearCursor(new BuildCityAction(currentPlayer.name, coord));
			setIsBuilding('None');
		}
		if (isBuilding === 'Road' && closestPoints[1].index !== -1) {
			const coord2 = getMatrixCoordCorner(hexToFind, closestPoints[1].index);
			const action =
				currentWorld.gameState === 'Started'
					? new BuildRoadAction(currentPlayer.name, coord, coord2)
					: new BuildRoadInitialAction(currentPlayer.name, coord, coord2);

			dispatchActionClearCursor(action);
			setIsBuilding('None');
		}
	}

	function handleClick(event: { data: { global: Point } }) {
		if (isBuilding !== 'None') {
			handleBuildClick(event);
		} else if (isMovingThief) {
			handleThiefClick(event);
		} else if (isPlayingKnight) {
			handleIsPlayingKnightClick(event);
		} else if (isPlayingRoadBuilding) {
			handleBuildClick(event);
		}
	}

	function createPiece(
		spriteType: string,
		dimensions: { x: number; y: number },
		tint: number,
		coord: { x: number; y: number }
	) {
		const generator = sprites[spriteType];
		const piece = generator();
		piece.width = dimensions.x;
		piece.height = dimensions.y;
		piece.tint = tint;
		piece.position.x = coord.x;
		piece.position.y = coord.y;
		piece.anchor.set(0.5);
		return piece;
	}

	function cursorForSprite(event: { data: { global: Point } }, type: string) {
		if (!viewport || !currentPlayer || !grid) return;
		const inWorld = viewport.toWorld(event.data.global);
		const closest = getClosestPoint(grid, inWorld);
		if (closest.index !== -1) {
			cursorGraphics.clear();
			cursorGraphics.removeChildren();
			const piece = createPiece(type, { x: 100, y: 100 }, currentPlayer.color, closest.point);
			piece.alpha = 0.6;
			cursorGraphics.addChild(piece);
		}
	}

	function cursorForRoad(event: { data: { global: Point } }) {
		if (!viewport || !currentPlayer || !grid) return;
		const inWorld = viewport.toWorld(event.data.global);
		const closestPoints = getTwoClosestPoints(grid, inWorld);

		cursorGraphics.clear();
		cursorGraphics.removeChildren();
		if (closestPoints[0].index !== -1 && closestPoints[1].index !== -1) {
			cursorGraphics.lineStyle(lineWidth, currentPlayer.color);
			cursorGraphics.moveTo(closestPoints[0].point.x, closestPoints[0].point.y);
			cursorGraphics.lineTo(closestPoints[1].point.x, closestPoints[1].point.y);
		}
	}

	function cursorForHex(event: { data: { global: Point } }) {
		if (!viewport || !currentPlayer || !grid) return;
		const inWorld = viewport.toWorld(event.data.global);
		const hexToFind = grid.pointToHex(inWorld);
		const hexOrigin = hexToFind.toPoint();
		const centerOfHex = {
			x: hexOrigin.x + hexToFind.width() / 2,
			y: hexOrigin.y + hexToFind.height() / 2
		};
		cursorGraphics.clear();
		cursorGraphics.removeChildren();
		const piece = createPiece('Thief', { x: 100, y: 100 }, currentPlayer.color, centerOfHex);
		piece.alpha = 0.6;
		cursorGraphics.addChild(piece);
	}

	function handleMove(event: { data: { global: Point } }) {
		if (isBuilding === 'House') {
			cursorForSprite(event, 'House');
			return;
		}
		if (isBuilding === 'City') {
			cursorForSprite(event, 'City');
			return;
		}
		if (isBuilding === 'Road') {
			cursorForRoad(event);
			return;
		}
		if (isMovingThief || isPlayingKnight) {
			cursorForHex(event);
		}
	}

	function addPiecesToContainer(player: Player, container: Container) {
		if (!grid || !hexFactory) return;
		const { color } = player;
		const roadGraphics = new Graphics();
		const sampleHex = hexFactory(0, 0);
		const hexWidth = sampleHex.width();
		const hexHeight = sampleHex.height();
		player.roads.forEach((road) => {
			roadGraphics.lineStyle(lineWidth, color);
			const start = matrixCoordToWorldCoord(road.start, hexWidth, hexHeight);
			const end = matrixCoordToWorldCoord(road.end, hexWidth, hexHeight);
			roadGraphics.moveTo(start.x, start.y);
			roadGraphics.lineTo(end.x, end.y);
		});
		container.addChild(roadGraphics);

		player.houses.forEach((house) => {
			const piece = createPiece(
				'House',
				{ x: 100, y: 100 },
				color,
				matrixCoordToWorldCoord(house.position, hexWidth, hexHeight)
			);
			container.addChild(piece);
		});

		player.cities.forEach((city) => {
			const piece = createPiece(
				'City',
				{ x: 124, y: 124 },
				color,
				matrixCoordToWorldCoord(city.position, hexWidth, hexHeight)
			);
			container.addChild(piece);
		});
	}

	function drawMap(newWorld: World | undefined, oldWorld: World | undefined) {
		if (!newWorld) {
			return;
		}

		const [redrawTiles, redrawPieces] = compareWorlds(oldWorld, newWorld);
		let tileContainer: Container | undefined;
		let pieceContainer: Container | undefined;
		const thief = newWorld.thief ? newWorld.thief.hexCoordinate : undefined;

		if (redrawTiles) {
			tileContainer = new Container();
			const map = !newWorld || !newWorld.map ? [] : newWorld.map;
			const Hex = extendHex({
				size: hexSize,
				orientation: 'flat'
			});
			grid = defineGrid(Hex);
			hexFactory = Hex;

			lineGraphics.removeChildren();
			lineGraphics.clear();
			map.forEach((tile) => {
				const hex = Hex(tile.coord.x, tile.coord.y);
				hex.center();
				const point = hex.toPoint();
				const corners = hex.corners().map((corner) => corner.add(point));
				const [firstCorner, ...otherCorners] = corners;
				const tileSprite = generateTile(tileWidth, tileHeight, tile, firstCorner);

				tileContainer?.addChild(tileSprite);
				if (newWorld.gameState === 'Started') {
					const tileNumber = generateTileNumber(tileWidth, hex.center(), hex.toPoint(), tile);
					if (tileNumber) {
						tileContainer?.addChild(tileNumber);
					}
				}

				if (thief && thief.x === hex.x && thief.y === hex.y) {
					const thiefSprite = generateThiefTile('Scorch', tileWidth, tileHeight, firstCorner);
					tileContainer?.addChild(thiefSprite);
				}

				lineGraphics.lineStyle(lineWidth, 0xffffff);
				lineGraphics.moveTo(firstCorner.x, firstCorner.y);
				otherCorners.forEach(({ x, y }) => lineGraphics.lineTo(x, y));
				lineGraphics.lineTo(firstCorner.x, firstCorner.y);
			});
		}

		if (redrawPieces) {
			pieceContainer = new Container();
			newWorld.players.forEach((player) => {
				addPiecesToContainer(player, pieceContainer!);
			});
		}

		if (redrawTiles && tileContainer) {
			tileGraphics.removeChildren();
			tileGraphics.clear();
			tileGraphics.addChild(tileContainer);
		}
		if (redrawPieces && pieceContainer) {
			pieceGraphics.removeChildren();
			pieceGraphics.clear();
			pieceGraphics.addChild(pieceContainer);
		}
	}

	function setupCanvas() {
		if (!container) return;

		height = container.clientHeight / (window.devicePixelRatio || 1);
		width = container.clientWidth / (window.devicePixelRatio || 1);

		const appInstance = new Application({
			width,
			height,
			antialias: true,
			resolution: window.devicePixelRatio || 1,
			transparent: true
		});

		const viewportInstance = new Viewport({
			screenWidth: width,
			screenHeight: height,
			worldHeight: 1000,
			worldWidth: 1000,
			interaction: appInstance.renderer.plugins.interaction
		});

		app = appInstance;
		viewport = viewportInstance;

		(appInstance.stage as any).addChild(viewportInstance as any);
		(viewportInstance as any).drag().pinch().wheel().decelerate();

		container.appendChild(appInstance.view as HTMLCanvasElement);
		(viewportInstance as any).addChild(tileGraphics);
		(viewportInstance as any).addChild(lineGraphics);
		(viewportInstance as any).addChild(pieceGraphics);
		(viewportInstance as any).addChild(cursorGraphics);

		const moveHandler = (event: { data: { global: Point } }) => handleMove(event);
		const clickHandler = (event: { data: { global: Point } }) => handleClick(event);
		const hoverHandler = () => {
			const selection = window.getSelection?.();
			selection?.removeAllRanges();
		};

		(viewportInstance as any).on('mousemove', moveHandler);
		(viewportInstance as any).on('pointerup', clickHandler);
		(viewportInstance as any).on('mouseover', hoverHandler);

		onDestroy(() => {
			(viewportInstance as any).off('mousemove', moveHandler);
			(viewportInstance as any).off('pointerup', clickHandler);
			(viewportInstance as any).off('mouseover', hoverHandler);
		});
	}

	onMount(() => {
		if (!browser) {
			return;
		}

		try {
			void bindToWorld();
		} catch (error) {
			console.warn('Unable to bind to world socket', error);
		}

		setupCanvas();
		handleResize();

		if (container) {
			resizeObserver = new ResizeObserver(() => handleResize());
			resizeObserver.observe(container);
		}

		const resizeListener = () => handleResize();
		window.addEventListener('resize', resizeListener);

		onDestroy(() => {
			resizeObserver?.disconnect();
			window.removeEventListener('resize', resizeListener);
			if (viewport) {
				viewport.destroy();
			}
			if (app) {
				app.destroy(true, { children: true, texture: true, baseTexture: true });
			}
		});
	});
</script>

<div bind:this={container} class="h-full w-full bg-[#03518b]"></div>
