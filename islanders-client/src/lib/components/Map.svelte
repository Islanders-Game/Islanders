<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import {
		Application,
		Container,
		Graphics,
		Point,
		Assets,
		FederatedPointerEvent
	} from 'pixi.js';
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
	let pointerDownPosition = { x: 0, y: 0 };
	let hasDragged = false;

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

	const handleThiefClick = (event: FederatedPointerEvent) => {
		if (!worldContainer || !grid) return;
		if (!currentPlayer) return;
		const inWorld = toWorld(event.global);
		const hexToFind = grid.pointToHex(inWorld);
		const moveThiefAction = new MoveThiefAction(currentPlayer.name, hexToFind);
		dispatchActionClearCursor(moveThiefAction);
		setIsMovingThief(false);
		setIsStealingFromPlayers(true);
	};

	const handleIsPlayingKnightClick = (event: FederatedPointerEvent) => {
		if (!worldContainer || !grid) return;
		if (!currentPlayer) return;
		const inWorld = toWorld(event.global);
		const hexToFind = grid.pointToHex(inWorld);
		const moveThiefAction = new MoveThiefDevCardAction(currentPlayer.name, hexToFind);
		dispatchActionClearCursor(moveThiefAction);
		setIsPlayingKnight(false);
		setIsStealingFromPlayers(true);
	};

	const handleBuildClick = (event: FederatedPointerEvent) => {
		if (!worldContainer || !currentPlayer || !currentWorld || !grid) return;

		const inWorld = toWorld(event.global);
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

	const handleClick = (event: FederatedPointerEvent) => {
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

	const cursorForSprite = (event: FederatedPointerEvent, type: string) => {
		if (!worldContainer || !currentPlayer || !grid) return;
		const inWorld = toWorld(event.global);
		const closest = getClosestPoint(grid, inWorld);
		if (closest.index !== -1) {
			cursorGraphics.clear();
			cursorGraphics.removeChildren();
			const piece = createPiece(type, { x: 100, y: 100 }, currentPlayer.color, closest.point);
			piece.alpha = 0.6;
			cursorGraphics.addChild(piece);
		}
	};

	const cursorForRoad = (event: FederatedPointerEvent) => {
		if (!worldContainer || !currentPlayer || !grid) return;
		const inWorld = toWorld(event.global);
		const closestPoints = getTwoClosestPoints(grid, inWorld);

		cursorGraphics.clear();
		cursorGraphics.removeChildren();
		if (closestPoints[0].index !== -1 && closestPoints[1].index !== -1) {
			// PixiJS v8: Use moveTo/lineTo and then stroke() with style
			cursorGraphics.moveTo(closestPoints[0].point.x, closestPoints[0].point.y);
			cursorGraphics.lineTo(closestPoints[1].point.x, closestPoints[1].point.y);
			cursorGraphics.stroke({ width: lineWidth, color: currentPlayer.color });
		}
	};

	const cursorForHex = (event: FederatedPointerEvent) => {
		if (!worldContainer || !currentPlayer || !grid) return;
		const inWorld = toWorld(event.global);
		const hexToFind = grid.pointToHex(inWorld);
		// In honeycomb v4, hex.x and hex.y are already the center coordinates
		const centerOfHex = {
			x: hexToFind.x,
			y: hexToFind.y
		};
		cursorGraphics.clear();
		cursorGraphics.removeChildren();
		const piece = createPiece('Thief', { x: 100, y: 100 }, currentPlayer.color, centerOfHex);
		piece.alpha = 0.6;
		cursorGraphics.addChild(piece);
	};

	const handleMove = (event: FederatedPointerEvent) => {
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
		// In honeycomb v4, width and height are properties, not methods
		const hexWidth = sampleHex.width;
		const hexHeight = sampleHex.height;
		player.roads.forEach((road) => {
			const start = matrixCoordToWorldCoord(road.start, hexWidth, hexHeight);
			const end = matrixCoordToWorldCoord(road.end, hexWidth, hexHeight);
			// PixiJS v8: Use moveTo/lineTo and then stroke() with style
			roadGraphics.moveTo(start.x, start.y);
			roadGraphics.lineTo(end.x, end.y);
			roadGraphics.stroke({ width: lineWidth, color });
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
				// In honeycomb v4, hex.x and hex.y are the center coordinates
				const point = { x: hex.x, y: hex.y };
				// corners is a property (getter), not a method, and returns Points relative to origin
				const corners = hex.corners;
				const minX = Math.min(...corners.map(({ x }) => x));
				const minY = Math.min(...corners.map(({ y }) => y));
				const topLeft = { x: minX, y: minY };
				const tileSprite = generateTile(tileWidth, tileHeight, tile, topLeft);

				tileContainer?.addChild(tileSprite);
				if (newWorld.gameState === 'Started') {
					// Pass hex center directly instead of recalculating
					const tileNumber = generateTileNumber(tileWidth, { x: hex.x, y: hex.y }, point, tile);
					if (tileNumber) {
						tileContainer?.addChild(tileNumber);
					}
				}

				if (thief && thief.x === hex.col && thief.y === hex.row) {
					const thiefSprite = generateThiefTile('Scorch', tileWidth, tileHeight, topLeft);
					tileContainer?.addChild(thiefSprite);
				}

				// PixiJS v8: Use poly() for closed polygons with stroke
				lineGraphics.poly(corners, true);
				lineGraphics.stroke({ width: lineWidth, color: 0xffffff });
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

	const setupCanvas = async () => {
		if (!container) return;

		height = container.clientHeight / (window.devicePixelRatio || 1);
		width = container.clientWidth / (window.devicePixelRatio || 1);

		// Preload all assets for PixiJS v8
		const tilePath = '/img/tilesets/';
		const tileStyle = 'realistic';
		const assetsToLoad = [
			// Tiles
			`${tilePath}${tileStyle}/clay.png`,
			`${tilePath}${tileStyle}/desert.png`,
			`${tilePath}${tileStyle}/grain.png`,
			`${tilePath}${tileStyle}/wood.png`,
			`${tilePath}${tileStyle}/stone.png`,
			`${tilePath}${tileStyle}/wool.png`,
			`${tilePath}${tileStyle}/ocean.png`,
			// Pieces
			'/img/pieces/house.png',
			'/img/pieces/city.png',
			'/img/pieces/thief.png',
			// Special
			`${tilePath}shared/scorch-with-thief.png`,
			// Harbors
			`${tilePath}${tileStyle}/woodharbor.png`,
			`${tilePath}${tileStyle}/woolharbor.png`,
			`${tilePath}${tileStyle}/grainharbor.png`,
			`${tilePath}${tileStyle}/clayharbor.png`,
			`${tilePath}${tileStyle}/stoneharbor.png`,
			`${tilePath}${tileStyle}/threetooneharbor.png`,
			// Numbers
			'/img/numbers/2.png',
			'/img/numbers/3.png',
			'/img/numbers/4.png',
			'/img/numbers/5.png',
			'/img/numbers/6.png',
			'/img/numbers/8.png',
			'/img/numbers/9.png',
			'/img/numbers/10.png',
			'/img/numbers/11.png',
			'/img/numbers/12.png'
		];

		// Load all assets
		try {
			console.log('Loading assets...');
			await Assets.load(assetsToLoad);
			console.log('Assets loaded successfully');
		} catch (error) {
			console.error('Failed to load assets:', error);
		}

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

				const stage = appInstance.stage;
				stage.eventMode = 'static';
				stage.hitArea = appInstance.screen;
				stage.addChild(worldContainerInstance);
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
				const moveHandler = (event: FederatedPointerEvent) => handleMove(event);
				const hoverHandler = () => {
					const selection = window.getSelection?.();
					selection?.removeAllRanges();
				};

				// Pan handlers
				const pointerDownHandler = (event: FederatedPointerEvent) => {
					if (event.button === 0) {
						// Left click only
						isDragging = true;
						hasDragged = false;
						pointerDownPosition = { x: event.global.x, y: event.global.y };
						lastPointerPosition = { x: event.global.x, y: event.global.y };
					}
				};

				const pointerMoveHandler = (event: FederatedPointerEvent) => {
					if (isDragging) {
						const dx = event.global.x - lastPointerPosition.x;
						const dy = event.global.y - lastPointerPosition.y;
						panX += dx;
						panY += dy;
						lastPointerPosition = { x: event.global.x, y: event.global.y };
						if (!hasDragged) {
							const totalDx = event.global.x - pointerDownPosition.x;
							const totalDy = event.global.y - pointerDownPosition.y;
							if (Math.abs(totalDx) > 2 || Math.abs(totalDy) > 2) {
								hasDragged = true;
							}
						}
						updateWorldTransform();
					}
				};

				const pointerUpHandler = (event: FederatedPointerEvent, shouldTriggerClick: boolean) => {
					if (isDragging) {
						isDragging = false;
					}
					if (shouldTriggerClick && !hasDragged) {
						handleClick(event);
					}
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

				stage.on('mousemove', moveHandler);
				stage.on('mouseover', hoverHandler);
				stage.on('pointerdown', pointerDownHandler);
				stage.on('pointermove', pointerMoveHandler);
				stage.on('pointerup', (event: FederatedPointerEvent) => pointerUpHandler(event, true));
				stage.on('pointerupoutside', (event: FederatedPointerEvent) => pointerUpHandler(event, false));

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

		void setupCanvas();
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
