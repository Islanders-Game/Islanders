import io from 'socket.io-client';
import Axios from 'axios';
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
import { SocketConnection, setSocket, type SocketLike } from './socket';
import {
	setIsBuilding,
	setIsMovingThief,
	setIsPlayingKnight,
	setIsPlayingRoadBuilding,
	setIsStealingFromPlayers,
	setPlayerProposesTrade
} from './ui.svelte';

export const gameState = $state({
	gameId: undefined as string | undefined,
	playerName: undefined as string | undefined,
	pointsToWin: 10,
	world: undefined as World | undefined,
	error: undefined as string | undefined
});

let worldBound = false;

function setWorld(world: World | undefined) {
	gameState.world = world;
}

function setError(errorMessage: string | undefined) {
	gameState.error = errorMessage;
}

function ensureSocket(): SocketLike {
	const socket = SocketConnection.socket;
	if (!socket) {
		throw new Error('Socket has not been initialised. Join or create a game first.');
	}
	return socket;
}

export async function bindToWorld(): Promise<void> {
	const socket = ensureSocket();
	if (worldBound) {
		return;
	}

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

	worldBound = true;
}

export async function startGame(pointsToWin: number): Promise<void> {
	const socket = ensureSocket();
	socket.emit(SocketActions.lockMap, pointsToWin);
}

export async function updateMap(map: Tile[]): Promise<void> {
	const socket = ensureSocket();
	socket.emit(SocketActions.newMap, map);
}

export async function sendAction(action: GameAction): Promise<void> {
	const socket = ensureSocket();
	socket.emit(SocketActions.sendAction, action);
}

export async function proposeTrade(action: ProposeTradeAction): Promise<void> {
	const socket = ensureSocket();
	socket.emit(SocketActions.proposeTrade, action);
}

function getHost(): string {
	return (
		import.meta.env.PUBLIC_SERVER_URL ??
		import.meta.env.VITE_SERVER_URL ??
		import.meta.env.VITE_APP_SERVER_URL ??
		'http://localhost:3002'
	);
}

export async function createGame(playerName: string): Promise<void> {
	const host = getHost();
	const { data } = await Axios.get<string>(`${host}/newgame`);
	const gameId = data;

	const socket = io(`${host}/${gameId}`, { transports: ['websocket'] });
	socket.emit(SocketActions.join, playerName);
	setSocket(socket as unknown as SocketLike);

	gameState.gameId = gameId;
	gameState.playerName = playerName;
}

export async function joinGame(gameId: string, playerName: string): Promise<void> {
	const host = getHost();
	const { data } = await Axios.get<Result>(`${host}/joingame`, {
		params: { gameId, playerName }
	});

	const flatmappable = toResultInstance(data);
	flatmappable.flatMap((world: World) => {
		const socket = io(`${host}/${gameId}`, { transports: ['websocket'] });
		socket.emit(SocketActions.join, playerName);
		setSocket(socket as unknown as SocketLike);

		gameState.gameId = gameId;
		gameState.playerName = playerName;
		setWorld(world);
		return success(world);
	});

	flatmappable.onFailure((reason: string) => {
		setError(reason);
	});
}

export function setPointsToWin(points: number) {
	gameState.pointsToWin = points;
	if (gameState.world) {
		gameState.world = { ...gameState.world, pointsToWin: points };
	}
}

export function getWorld(): World | undefined {
	return gameState.world;
}

export function getError(): string | undefined {
	return gameState.error;
}

export function getPlayers(): Player[] | undefined {
	return gameState.world?.players;
}

export function getPlayer(name: string): Player | undefined {
	return gameState.world?.players.find((player) => player.name === name);
}

export function getIsGameStarted(): boolean {
	const world = gameState.world;
	if (!world) {
		return false;
	}
	return world.gameState === 'Started' || world.gameState === 'Pregame';
}

export function getCurrentPlayer(): Player | undefined {
	const world = gameState.world;
	return world ? world.players[world.currentPlayer] : undefined;
}

export function getCurrentDie(): DiceRoll | undefined {
	return gameState.world?.currentDie;
}

export function getPointsToWin(): number {
	return gameState.world?.pointsToWin ?? gameState.pointsToWin;
}

export function getPlayerColorAsHex(name: string): string | undefined {
	const color = gameState.world?.players.find((player) => player.name === name)?.color;
	if (color === undefined) {
		return undefined;
	}
	return `#${(color >>> 0).toString(16).padStart(6, '0')}`;
}

export function resetGameState() {
	gameState.gameId = undefined;
	gameState.playerName = undefined;
	gameState.pointsToWin = 10;
	gameState.world = undefined;
	gameState.error = undefined;
	worldBound = false;
}
