<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Application, Container, Graphics, Point } from 'pixi.js';
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
	import * as honeycombGrid from 'honeycomb-grid';
	import type { Grid as HoneycombGrid } from 'honeycomb-grid';
	const { defineHex, Grid, Orientation } = honeycombGrid;

	let container: HTMLDivElement | undefined;

	const hexSize = 200;
	const tileHeight = 348;
	const tileWidth = 400;
	const lineWidth = 14;

	let app: Application | undefined;
	let worldContainer: Container | undefined;
	const tileGraphics = new Graphics();
	const pieceGraphics = new Graphics();
	const lineGraphics = new Graphics();
	const cursorGraphics = new Graphics();
	const sprites = generateSprites();

	type HexType = ReturnType<typeof defineHex>;
	type CustomHex = InstanceType<HexType>;
	let grid: HoneycombGrid<CustomHex> | undefined;
	let hexFactory: HexType | undefined;

	let height = 0;
	let width = 0;

	// Pan and zoom state
	let scale = 1;
	let panX = 0;
	let panY = 0;
	let isDragging = false;
	let lastPointerPosition = { x: 0, y: 0 };

	let currentPlayer: Player | undefined;
	let currentWorld: World | undefined;

	let isBuilding: BuildingType = 'None';
	let isMovingThief = false;
	let isPlayingKnight = false;
	let isPlayingRoadBuilding = false;

	let resizeObserver: ResizeObserver | undefined;
	let previousWorld: World | undefined;

	// Store event handlers for cleanup
	let wheelHandler: ((event: WheelEvent) => void) | undefined;

	$effect(() => {
		const nextWorld = gameState.world;
		const playerName = gameState.playerName;
		currentPlayer = playerName
			? nextWorld?.players.find((player: Player) => player.name === playerName)
			: undefined;
		currentWorld = nextWorld;
		if (nextWorld !== previousWorld) {
			drawMap(nextWorld, previousWorld);
			previousWorld = nextWorld;
		}
	});

	$effect(() => {
		isBuilding = uiState.isBuilding;
		isMovingThief = uiState.isMovingThief;
		isPlayingKnight = uiState.isPlayingKnight;
		isPlayingRoadBuilding = uiState.isPlayingRoadBuilding;
	});

	// Convert screen coordinates to world coordinates
	const toWorld = (screenPoint: { x: number; y: number }): { x: number; y: number } => {
		return {
			x: (screenPoint.x - panX) / scale,
			y: (screenPoint.y - panY) / scale
		};
	};

	// Update world container transform
	const updateWorldTransform = () => {
		if (!worldContainer) return;
		worldContainer.scale.set(scale);
		worldContainer.position.set(panX, panY);
	};

	const handleResize = () => {
		if (!container || !app || !worldContainer) {
			return;
		}

		height = container.clientHeight / (window.devicePixelRatio || 1);
		width = container.clientWidth / (window.devicePixelRatio || 1);
		app.renderer.resize(width, height);
	};

	const dispatchActionClearCursor = async (action: GameAction) => {
		cursorGraphics.clear();
		cursorGraphics.removeChildren();
		try {
			await sendAction(action);
		} catch (error) {
			console.warn('Failed to send action', error);
		}
	};

	const handleThiefClick = (event: { data: { global: Point } }) => {
		if (!worldContainer || !grid) return;
		if (!currentPlayer) return;
		const inWorld = toWorld(event.data.global);
		const hexToFind = grid.pointToHex(inWorld);
		const moveThiefAction = new MoveThiefAction(currentPlayer.name, hexToFind);
		dispatchActionClearCursor(moveThiefAction);
		setIsMovingThief(false);
		setIsStealingFromPlayers(true);
	};

	const handleIsPlayingKnightClick = (event: { data: { global: Point } }) => {
		if (!worldContainer || !grid) return;
		if (!currentPlayer) return;
		const inWorld = toWorld(event.data.global);
		const hexToFind = grid.pointToHex(inWorld);
		const moveThiefAction = new MoveThiefDevCardAction(currentPlayer.name, hexToFind);
		dispatchActionClearCursor(moveThiefAction);
		setIsPlayingKnight(false);
		setIsStealingFromPlayers(true);
	};

	const handleBuildClick = (event: { data: { global: Point } }) => {
		if (!worldContainer || !currentPlayer || !currentWorld || !grid) return;

		const inWorld = toWorld(event.data.global);
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
	};

	const handleClick = (event: { data: { global: Point } }) => {
		if (isBuilding !== 'None') {
			handleBuildClick(event);
		} else if (isMovingThief) {
			handleThiefClick(event);
		} else if (isPlayingKnight) {
			handleIsPlayingKnightClick(event);
		} else if (isPlayingRoadBuilding) {
			handleBuildClick(event);
		}
	};

	const createPiece = (
		spriteType: string,
		dimensions: { x: number; y: number },
		tint: number,
		coord: { x: number; y: number }
	) => {
		const generator = sprites[spriteType];
		const piece = generator();
		piece.width = dimensions.x;
		piece.height = dimensions.y;
		piece.tint = tint;
		piece.position.x = coord.x;
		piece.position.y = coord.y;
		piece.anchor.set(0.5);
		return piece;
	};

	const cursorForSprite = (event: { data: { global: Point } }, type: string) => {
		if (!worldContainer || !currentPlayer || !grid) return;
		const inWorld = toWorld(event.data.global);
		const closest = getClosestPoint(grid, inWorld);
		if (closest.index !== -1) {
			cursorGraphics.clear();
			cursorGraphics.removeChildren();
			const piece = createPiece(type, { x: 100, y: 100 }, currentPlayer.color, closest.point);
			piece.alpha = 0.6;
			cursorGraphics.addChild(piece);
		}
	};

	const cursorForRoad = (event: { data: { global: Point } }) => {
		if (!worldContainer || !currentPlayer || !grid) return;
		const inWorld = toWorld(event.data.global);
		const closestPoints = getTwoClosestPoints(grid, inWorld);

		cursorGraphics.clear();
		cursorGraphics.removeChildren();
		if (closestPoints[0].index !== -1 && closestPoints[1].index !== -1) {
			cursorGraphics.lineStyle(lineWidth, currentPlayer.color);
			cursorGraphics.moveTo(closestPoints[0].point.x, closestPoints[0].point.y);
			cursorGraphics.lineTo(closestPoints[1].point.x, closestPoints[1].point.y);
		}
	};

	const cursorForHex = (event: { data: { global: Point } }) => {
		if (!worldContainer || !currentPlayer || !grid) return;
		const inWorld = toWorld(event.data.global);
		const hexToFind = grid.pointToHex(inWorld);
		const centerOfHex = {
			x: hexToFind.x + hexToFind.width / 2,
			y: hexToFind.y + hexToFind.height / 2
		};
		cursorGraphics.clear();
		cursorGraphics.removeChildren();
		const piece = createPiece('Thief', { x: 100, y: 100 }, currentPlayer.color, centerOfHex);
		piece.alpha = 0.6;
		cursorGraphics.addChild(piece);
	};

	const handleMove = (event: { data: { global: Point } }) => {
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
	};

	const addPiecesToContainer = (player: Player, container: Container) => {
		if (!grid || !hexFactory) return;
		const { color } = player;
		const roadGraphics = new Graphics();
		const sampleHex = new hexFactory({ col: 0, row: 0 });
		const hexWidth = sampleHex.width;
		const hexHeight = sampleHex.height;
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
	};

	const drawMap = (newWorld: World | undefined, oldWorld: World | undefined) => {
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

			const Hex = defineHex({
				dimensions: hexSize,
				orientation: Orientation.FLAT
			});
			grid = new Grid(Hex);
			hexFactory = Hex;

			lineGraphics.removeChildren();
			lineGraphics.clear();
			map.forEach((tile) => {
				const hex = new Hex({ col: tile.coord.x, row: tile.coord.y });
				const point = { x: hex.x, y: hex.y };
				const center = hex.center;
				const corners = hex.corners;
				const [firstCorner, ...otherCorners] = corners;
				const tileSprite = generateTile(tileWidth, tileHeight, tile, firstCorner);

				tileContainer?.addChild(tileSprite);
				if (newWorld.gameState === 'Started') {
					const tileNumber = generateTileNumber(tileWidth, center, point, tile);
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
	};

	const setupCanvas = () => {
		if (!container) return;

		height = container.clientHeight / (window.devicePixelRatio || 1);
		width = container.clientWidth / (window.devicePixelRatio || 1);

		const appInstance = new Application();

		// Initialize PixiJS v8 (async)
		void appInstance
			.init({
				width,
				height,
				antialias: true,
				resolution: window.devicePixelRatio || 1,
				backgroundAlpha: 0
			})
			.then(() => {
				const worldContainerInstance = new Container();
				worldContainerInstance.eventMode = 'static';
				worldContainerInstance.hitArea = appInstance.screen;

				app = appInstance;
				worldContainer = worldContainerInstance;

				appInstance.stage.addChild(worldContainerInstance);
				container?.appendChild(appInstance.canvas);

				worldContainerInstance.addChild(tileGraphics);
				worldContainerInstance.addChild(lineGraphics);
				worldContainerInstance.addChild(pieceGraphics);
				worldContainerInstance.addChild(cursorGraphics);

				// Set initial position (center the view)
				panX = width / 2;
				panY = height / 2;
				updateWorldTransform();

				// Event handlers
				const moveHandler = (event: { data: { global: Point } }) => handleMove(event);
				const clickHandler = (event: { data: { global: Point } }) => handleClick(event);
				const hoverHandler = () => {
					const selection = window.getSelection?.();
					selection?.removeAllRanges();
				};

				// Pan handlers
				const pointerDownHandler = (event: any) => {
					if (event.data.button === 0) {
						// Left click only
						isDragging = true;
						lastPointerPosition = { x: event.data.global.x, y: event.data.global.y };
					}
				};

				const pointerMoveHandler = (event: any) => {
					if (isDragging) {
						const dx = event.data.global.x - lastPointerPosition.x;
						const dy = event.data.global.y - lastPointerPosition.y;
						panX += dx;
						panY += dy;
						lastPointerPosition = { x: event.data.global.x, y: event.data.global.y };
						updateWorldTransform();
					}
				};

				const pointerUpHandler = () => {
					isDragging = false;
				};

				// Zoom handler
				wheelHandler = (event: WheelEvent) => {
					event.preventDefault();
					const delta = -event.deltaY;
					const zoomFactor = delta > 0 ? 1.1 : 0.9;
					const newScale = scale * zoomFactor;

					// Limit zoom levels
					if (newScale >= 0.1 && newScale <= 5) {
						const mouseX = event.clientX;
						const mouseY = event.clientY;

						// Zoom towards mouse position
						const worldPosBefore = toWorld({ x: mouseX, y: mouseY });
						scale = newScale;
						const worldPosAfter = toWorld({ x: mouseX, y: mouseY });

						panX += (worldPosAfter.x - worldPosBefore.x) * scale;
						panY += (worldPosAfter.y - worldPosBefore.y) * scale;

						updateWorldTransform();
					}
				};

				worldContainerInstance.on('mousemove', moveHandler);
				worldContainerInstance.on('pointerup', clickHandler);
				worldContainerInstance.on('mouseover', hoverHandler);
				worldContainerInstance.on('pointerdown', pointerDownHandler);
				worldContainerInstance.on('pointermove', pointerMoveHandler);
				worldContainerInstance.on('pointerup', pointerUpHandler);
				worldContainerInstance.on('pointerupoutside', pointerUpHandler);

				if (container) {
					container.addEventListener('wheel', wheelHandler, { passive: false });
				}
			});
	};

	onMount(() => {
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

		return () => {
			resizeObserver?.disconnect();
			window.removeEventListener('resize', resizeListener);
			if (wheelHandler && container) {
				container.removeEventListener('wheel', wheelHandler);
			}
			if (app) {
				app.destroy(true, { children: true, texture: true });
			}
		};
	});
</script>

<div bind:this={container} class="h-full w-full bg-[#03518b]"></div>
