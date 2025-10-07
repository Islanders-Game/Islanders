import {
	SocketActions,
	success,
	toResultInstance,
	type Action as GameAction,
	type DiceRoll,
	type Player,
	type Result,
	type World,
	type Tile
} from '../../../../islanders-shared/lib/Shared';
import type { ProposeTradeAction } from '../../../../islanders-shared/lib/Action';

import {
	setIsBuilding,
	setIsMovingThief,
	setIsPlayingKnight,
	setIsPlayingRoadBuilding,
	setPlayerProposesTrade
} from './ui.svelte';
import { connect, disconnect } from './socket.ts';
import { env } from '$env/dynamic/public';

const DEFAULT_POINTS_TO_WIN = 10;

export interface GameState {
	gameId: string | undefined;
	playerName: string | undefined;
	pointsToWin: number;
	world: World | undefined;
	error: string | undefined;
}

function createInitialGameState(): GameState {
	return {
		gameId: undefined,
		playerName: undefined,
		pointsToWin: DEFAULT_POINTS_TO_WIN,
		world: undefined,
		error: undefined
	};
}

export const gameState = $state(createInitialGameState());

const setWorld = (world: World | undefined) => {
	gameState.world = world;
};

const setError = (errorMessage: string | undefined) => {
	gameState.error = errorMessage;
};

export const bindToWorld = async (): Promise<void> => {
	const socket = connect();

	socket.on(SocketActions.newWorld, (result: Result) => {
		const asResultInstance = toResultInstance(result);
		asResultInstance
			.flatMap((world: World) => {
				setWorld(world);
				if (world.conditions?.playedKnight && !world.conditions.playedKnight.movedThief) {
					setIsPlayingKnight(true);
				}
				if (world.conditions?.playedRoadBuilding) {
					const { roadsBuilt, expected } = world.conditions.playedRoadBuilding;
					if (expected && roadsBuilt && expected < roadsBuilt) {
						setIsPlayingRoadBuilding(true);
						setIsBuilding('Road');
						setIsMovingThief(false);
					} else {
						setIsPlayingRoadBuilding(false);
						setIsBuilding('None');
					}
				}
				setError(undefined);
				return success(world);
			})
			.onFailure((reason: string) => {
				setError(reason);
			});
	});

	socket.on(SocketActions.proposeTrade, (action: ProposeTradeAction) => {
		const mapped = {
			player: action.parameters.playerName,
			wants: action.parameters.wantsResources,
			resources: action.parameters.resources
		};
		setPlayerProposesTrade(mapped);
	});
};

export const startGame = async (pointsToWin: number): Promise<void> => {
	const socket = connect();
	socket.emit(SocketActions.lockMap, pointsToWin);
};

export const updateMap = async (map: Tile[]): Promise<void> => {
	const socket = connect();
	socket.emit(SocketActions.newMap, map);
};

export const sendAction = async (action: GameAction): Promise<void> => {
	const socket = connect();
	socket.emit(SocketActions.sendAction, action);
};

export const proposeTrade = async (action: ProposeTradeAction): Promise<void> => {
	const socket = connect();
	socket.emit(SocketActions.proposeTrade, action);
};

export const createGame = async (playerName: string): Promise<void> => {
	const host = env.PUBLIC_SERVER;
	console.log('Creating game at host:', host);
	const response = await fetch(`${host}/newgame`);
	const { id }: { id: string } = await response.json();
	console.log(`Created game with ID: ${id}`);

	const socket = connect(`${host}/${id}`);
	socket.emit(SocketActions.join, playerName);

	gameState.gameId = id;
	gameState.playerName = playerName;
};

export async function joinGame(gameId: string, playerName: string): Promise<void> {
	const host = env.PUBLIC_SERVER;
	const response = await fetch(`${host}/joingame?gameId=${gameId}&playerName=${playerName}`);
	const data: Result = await response.json();

	const flatmappable = toResultInstance(data);
	flatmappable.flatMap((world: World) => {
		const socket = connect(`${host}/${gameId}`);
		socket.emit(SocketActions.join, playerName);

		gameState.gameId = gameId;
		gameState.playerName = playerName;
		setWorld(world);
		return success(world);
	});

	flatmappable.onFailure((reason: string) => {
		setError(reason);
	});
}

export const setPointsToWin = (points: number) => {
	gameState.pointsToWin = points;
	if (gameState.world) {
		gameState.world = { ...gameState.world, pointsToWin: points };
	}
};

export const getWorld = (): World | undefined => {
	return gameState.world;
};

export const getError = (): string | undefined => {
	return gameState.error;
};

export const getPlayers = (): Player[] | undefined => {
	return gameState.world?.players;
};

export const getPlayer = (name: string): Player | undefined => {
	return gameState.world?.players.find((player) => player.name === name);
};

export const getIsGameStarted = (): boolean => {
	const world = gameState.world;
	if (!world) {
		return false;
	}
	return world.gameState === 'Started' || world.gameState === 'Pregame';
};

export const getCurrentPlayer = (): Player | undefined => {
	const world = gameState.world;
	return world ? world.players[world.currentPlayer] : undefined;
};

export const getCurrentDie = (): DiceRoll | undefined => {
	return gameState.world?.currentDie;
};

export const getPointsToWin = (): number => {
	return gameState.world?.pointsToWin ?? gameState.pointsToWin;
};

export const getPlayerColorAsHex = (name: string): string | undefined => {
	const color = gameState.world?.players.find((player) => player.name === name)?.color;
	if (color === undefined) {
		return undefined;
	}
	return `#${(color >>> 0).toString(16).padStart(6, '0')}`;
};

export const resetGameState = () => {
	const initialState = createInitialGameState();
	gameState.gameId = initialState.gameId;
	gameState.playerName = initialState.playerName;
	gameState.pointsToWin = initialState.pointsToWin;
	gameState.world = initialState.world;
	gameState.error = initialState.error;
	disconnect();
};
