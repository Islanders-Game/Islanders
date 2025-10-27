<script lang="ts">
	import { onMount } from 'svelte';
	import { Application, Container, Graphics, Point, Assets, FederatedPointerEvent } from 'pixi.js';
	import type { BuildingType } from '$lib/stores/ui.svelte';
	import {
		type World,
		type Player,
		getMatrixCoordCorner
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
	import { getClosestPoint, getTwoClosestPoints, matrixCoordToGridWorldCoord } from './mapUtils';
	import * as honeycombGrid from 'honeycomb-grid';
	import type { Grid as HoneycombGrid } from 'honeycomb-grid';
	import { getWorld } from '$lib/stores/socket.svelte';
	import { playerName, sendAction } from '$lib/stores/game.svelte';
	const { defineHex, Grid, Orientation } = honeycombGrid;
	import type { Resources } from '../../../../islanders-shared/lib/Shared';

	type TradeParameters = { player: string; resources: Resources; wants: Resources };
	type HexType = ReturnType<typeof defineHex>;
	type CustomHex = InstanceType<HexType>;

	const currentPlayer: Player | undefined = $derived(
		getWorld()?.players.find((player: Player) => player.name === playerName)
	);
	let isBuilding = $state<BuildingType>('None');
	let isMovingThief = $state(false);
	let isPlayingRoadBuilding = $state(false);
	let isPlayingKnight = $state(false);
	let isStealingFromPlayers = $state(false);
	let playerProposesTrade = $state<TradeParameters | undefined>(undefined);

	const hexSize = 200;
	const tileHeight = 348;
	const tileWidth = 400;
	const lineWidth = 14;
	const tilePath = '/img/tilesets/';
	const tileStyle = 'realistic';
	const assetsToLoad = [
		`${tilePath}${tileStyle}/clay.png`,
		`${tilePath}${tileStyle}/desert.png`,
		`${tilePath}${tileStyle}/grain.png`,
		`${tilePath}${tileStyle}/wood.png`,
		`${tilePath}${tileStyle}/stone.png`,
		`${tilePath}${tileStyle}/wool.png`,
		`${tilePath}${tileStyle}/ocean.png`,
		'/img/pieces/house.png',
		'/img/pieces/city.png',
		'/img/pieces/thief.png',
		`${tilePath}shared/scorch-with-thief.png`,
		`${tilePath}${tileStyle}/woodharbor.png`,
		`${tilePath}${tileStyle}/woolharbor.png`,
		`${tilePath}${tileStyle}/grainharbor.png`,
		`${tilePath}${tileStyle}/clayharbor.png`,
		`${tilePath}${tileStyle}/stoneharbor.png`,
		`${tilePath}${tileStyle}/threetooneharbor.png`,
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

	const tileGraphics = new Graphics();
	const pieceGraphics = new Graphics();
	const lineGraphics = new Graphics();
	const cursorGraphics = new Graphics();
	const sprites = generateSprites();

	let app: Application | undefined;
	let worldContainer: Container | undefined;
	let grid: HoneycombGrid<CustomHex> | undefined;
	let container: HTMLDivElement | undefined;
	let parentElement: HTMLElement | null = null;
	let hexFactory: HexType | undefined;

	let height = 0;
	let width = 0;

	let scale = 1;
	let panX = 0;
	let panY = 0;

	let isDragging = false;
	let lastPointerPosition = { x: 0, y: 0 };
	let pointerDownPosition = { x: 0, y: 0 };
	let hasDragged = false;
	let wheelPointerPosition = new Point();
	let wheelHandler: ((event: WheelEvent) => void) | undefined;

	let resizeObserver: ResizeObserver | undefined;

	let assetsLoaded = false;
	let latestWorld: World | undefined;
	let loadingPromise: Promise<void> | undefined;

	$effect(() => {
		updateMap(getWorld());
	});

	const toWorld = (screenPoint: { x: number; y: number }): { x: number; y: number } => {
		return {
			x: (screenPoint.x - panX) / scale,
			y: (screenPoint.y - panY) / scale
		};
	};

	const updateWorldTransform = () => {
		if (!worldContainer) return;
		worldContainer.scale.set(scale);
		worldContainer.position.set(panX, panY);
	};

	const handleResize = () => {
		if (!container || !app || !worldContainer) {
			return;
		}

		const prevCenterWorld = toWorld({ x: width / 2, y: height / 2 });

		const target = parentElement ?? container;
		width = target.clientWidth;
		height = target.clientHeight;
		container.style.width = `${width}px`;
		container.style.height = `${height}px`;

		app.renderer.resize(width, height);
		app.stage.hitArea = app.screen;
		worldContainer.hitArea = app.screen;

		panX = width / 2 - prevCenterWorld.x * scale;
		panY = height / 2 - prevCenterWorld.y * scale;
		updateWorldTransform();
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
		const hexCoord = { x: hexToFind.col, y: hexToFind.row };
		const moveThiefAction = new MoveThiefAction(currentPlayer.name, hexCoord);
		dispatchActionClearCursor(moveThiefAction);
		isMovingThief = false;
	};

	const handleIsPlayingKnightClick = (event: FederatedPointerEvent) => {
		if (!worldContainer || !grid) return;
		if (!currentPlayer) return;
		const inWorld = toWorld(event.global);
		const hexToFind = grid.pointToHex(inWorld);
		const hexCoord = { x: hexToFind.col, y: hexToFind.row };
		const moveThiefAction = new MoveThiefDevCardAction(currentPlayer.name, hexCoord);
		dispatchActionClearCursor(moveThiefAction);
		isStealingFromPlayers = true;
	};

	const handleBuildClick = (event: FederatedPointerEvent) => {
		if (!worldContainer || !currentPlayer || !getWorld() || !grid) return;

		const inWorld = toWorld(event.global);
		const closestPoints = getTwoClosestPoints(grid, inWorld);
		if (closestPoints[0].index === -1) {
			return;
		}
		const hexToFind = grid.pointToHex(inWorld);
		const hexCoord = { x: hexToFind.col, y: hexToFind.row };
		const coord = getMatrixCoordCorner(hexCoord, closestPoints[0].index);

		if (isBuilding === 'House') {
			const action =
				getWorld()?.gameState === 'Started'
					? new BuildHouseAction(currentPlayer.name, coord)
					: new BuildHouseInitialAction(currentPlayer.name, coord);

			dispatchActionClearCursor(action);
			isBuilding = 'None';
		}
		if (isBuilding === 'City') {
			dispatchActionClearCursor(new BuildCityAction(currentPlayer.name, coord));
			isBuilding = 'None';
		}
		if (isBuilding === 'Road' && closestPoints[1].index !== -1) {
			const coord2 = getMatrixCoordCorner(hexCoord, closestPoints[1].index);
			const action =
				getWorld()?.gameState === 'Started'
					? new BuildRoadAction(currentPlayer.name, coord, coord2)
					: new BuildRoadInitialAction(currentPlayer.name, coord, coord2);

			dispatchActionClearCursor(action);
			isBuilding = 'None';
		}
	};

	const handleClick = (event: FederatedPointerEvent) => {
		if (isBuilding !== 'None' || isPlayingRoadBuilding) {
			handleBuildClick(event);
		} else if (isMovingThief) {
			handleThiefClick(event);
		} else if (isPlayingKnight) {
			handleIsPlayingKnightClick(event);
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
		piece.position.set(coord.x, coord.y);
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
		const factory = hexFactory;

		player.roads.forEach((road) => {
			const start = matrixCoordToGridWorldCoord(road.start, factory);
			const end = matrixCoordToGridWorldCoord(road.end, factory);
			roadGraphics.moveTo(start.x, start.y);
			roadGraphics.lineTo(end.x, end.y);
			roadGraphics.stroke({ width: lineWidth, color });
		});
		container.addChild(roadGraphics);

		player.houses.forEach((house) => {
			const worldCoord = matrixCoordToGridWorldCoord(house.position, factory);
			const piece = createPiece('House', { x: 100, y: 100 }, color, worldCoord);
			container.addChild(piece);
		});

		player.cities.forEach((city) => {
			const worldCoord = matrixCoordToGridWorldCoord(city.position, factory);
			const piece = createPiece('City', { x: 124, y: 124 }, color, worldCoord);
			container.addChild(piece);
		});
	};

	const drawMap = (newWorld: World) => {
		if (!newWorld) {
			return;
		}

		let tileContainer: Container | undefined;
		let pieceContainer: Container | undefined;
		const thief = newWorld.thief ? newWorld.thief.hexCoordinate : undefined;

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
				// Pass hex center and zero origin since hex.x/hex.y are already world coordinates
				const tileNumber = generateTileNumber(
					tileWidth,
					{ x: hex.x, y: hex.y },
					{ x: 0, y: 0 },
					tile
				);
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
		pieceContainer = new Container();
		newWorld.players.forEach((player) => {
			addPiecesToContainer(player, pieceContainer!);
		});

		tileGraphics.removeChildren();
		tileGraphics.clear();
		tileGraphics.addChild(tileContainer);
		pieceGraphics.removeChildren();
		pieceGraphics.clear();
		pieceGraphics.addChild(pieceContainer);
	};

	const updateMap = (newWorld: World | undefined) => {
		if (!newWorld) {
			return;
		}

		latestWorld = newWorld;
		if (!assetsLoaded) {
			void ensureAssetsLoaded();
			return;
		}

		drawMap(newWorld);
	};

	const ensureAssetsLoaded = async () => {
		if (assetsLoaded) {
			return;
		}

		if (!loadingPromise) {
			loadingPromise = Assets.load(assetsToLoad)
				.then(() => {
					assetsLoaded = true;
					if (latestWorld) {
						drawMap(latestWorld);
					}
				})
				.catch((error) => {
					console.error('Failed to load assets:', error);
				});
		}

		await loadingPromise;
	};

	const setupCanvas = async () => {
		if (!container) return;

		parentElement = container.parentElement;
		const target = parentElement ?? container;
		// Use raw client sizes (renderer resolution will scale for DPR)
		height = target.clientHeight;
		width = target.clientWidth;
		container.style.width = `${target.clientWidth}px`;
		container.style.height = `${target.clientHeight}px`;

		await ensureAssetsLoaded();

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

				worldContainerInstance.addChild(tileGraphics, lineGraphics, pieceGraphics, cursorGraphics);

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
					if (!app) {
						return;
					}
					event.preventDefault();
					const delta = -event.deltaY;
					const zoomIntensity = 0.0005;
					const zoomFactor = Math.exp(delta * zoomIntensity);
					const minScale = 0.08;
					const maxScale = 2;
					const targetScale = scale * zoomFactor;
					const newScale = Math.min(maxScale, Math.max(minScale, targetScale));

					// Limit zoom levels
					if (newScale !== scale) {
						app.renderer.events.mapPositionToPoint(
							wheelPointerPosition,
							event.clientX,
							event.clientY
						);
						const mouseX = wheelPointerPosition.x;
						const mouseY = wheelPointerPosition.y;

						// Zoom towards mouse position
						const worldPosBefore = toWorld({ x: mouseX, y: mouseY });
						scale = newScale;
						panX = mouseX - worldPosBefore.x * scale;
						panY = mouseY - worldPosBefore.y * scale;

						updateWorldTransform();
					}
				};

				stage.on('mousemove', moveHandler);
				stage.on('mouseover', hoverHandler);
				stage.on('pointerdown', pointerDownHandler);
				stage.on('pointermove', pointerMoveHandler);
				stage.on('pointerup', (event: FederatedPointerEvent) => pointerUpHandler(event, true));
				stage.on('pointerupoutside', (event: FederatedPointerEvent) =>
					pointerUpHandler(event, false)
				);

				if (container) {
					container.addEventListener('wheel', wheelHandler, { passive: false });
				}
			});
	};

	onMount(() => {
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

<div bind:this={container} class="h-full w-full flex-1 bg-slate-500"></div>
