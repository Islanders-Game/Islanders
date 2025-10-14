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
} from '../../../../islanders-shared/lib/Shared.ts';
import type { ProposeTradeAction } from '../../../../islanders-shared/lib/Action.ts';

import { uiStore } from './ui.svelte.ts';
import { browser } from '$app/environment';
import { socketManager } from './socket.svelte.ts';
import { env } from '$env/dynamic/public';
import type { Socket } from 'socket.io-client';

const DEFAULT_POINTS_TO_WIN = 10;
const SESSION_KEY = 'islanders:session';

interface GameSession {
	gameId: string;
	playerName: string;
}

class GameStore {
	gameId = $state<string | undefined>(undefined);
	playerName = $state<string | undefined>(undefined);
	pointsToWin = $state(DEFAULT_POINTS_TO_WIN);
	world = $state<World | undefined>(undefined);
	error = $state<string | undefined>(undefined);

	private socketListenersBound = false;

	// Derived/computed values
	get players(): Player[] | undefined {
		return this.world?.players;
	}

	get isGameStarted(): boolean {
		if (!this.world) {
			return false;
		}
		return this.world.gameState === 'Started' || this.world.gameState === 'Pregame';
	}

	get currentPlayer(): Player | undefined {
		return this.world ? this.world.players[this.world.currentPlayer] : undefined;
	}

	get currentDie(): DiceRoll | undefined {
		return this.world?.currentDie;
	}

	get effectivePointsToWin(): number {
		return this.world?.pointsToWin ?? this.pointsToWin;
	}

	private readSession(): GameSession | undefined {
		if (!browser) {
			return undefined;
		}

		try {
			const raw = localStorage.getItem(SESSION_KEY);
			if (!raw) return undefined;
			const parsed = JSON.parse(raw) as GameSession;
			if (!parsed.gameId || !parsed.playerName) {
				return undefined;
			}
			return parsed;
		} catch (error) {
			console.warn('Failed to parse game session from storage', error);
			return undefined;
		}
	}

	private persistSession(session: GameSession) {
		if (!browser) return;
		try {
			localStorage.setItem(SESSION_KEY, JSON.stringify(session));
		} catch (error) {
			console.warn('Failed to persist game session', error);
		}
	}

	private clearSession() {
		if (!browser) return;
		try {
			localStorage.removeItem(SESSION_KEY);
		} catch (error) {
			console.warn('Failed to clear game session', error);
		}
	}

	private resolvePlayerName(gameId: string, provided?: string): string | undefined {
		const trimmed = provided?.trim();
		if (trimmed) {
			return trimmed;
		}

		const session = this.readSession();
		if (session && session.gameId === gameId && session.playerName.trim()) {
			return session.playerName.trim();
		}

		return undefined;
	}

	bindToWorld(): Socket {
		const socket = socketManager.connect();

		if (this.socketListenersBound) {
			return socket;
		}

		socket.on(SocketActions.newWorld, (result: Result) => {
			const asResultInstance = toResultInstance(result);
			asResultInstance
				.flatMap((world: World) => {
					this.world = world;
					if (world.conditions?.playedKnight && !world.conditions.playedKnight.movedThief) {
						uiStore.setPlayingKnight(true);
					}
					if (world.conditions?.playedRoadBuilding) {
						const { roadsBuilt, expected } = world.conditions.playedRoadBuilding;
						if (expected && roadsBuilt && expected < roadsBuilt) {
							uiStore.setPlayingRoadBuilding(true);
							uiStore.setBuilding('Road');
							uiStore.setMovingThief(false);
						} else {
							uiStore.setPlayingRoadBuilding(false);
							uiStore.setBuilding('None');
						}
					}
					this.error = undefined;
					return success(world);
				})
				.onFailure((reason: string) => {
					this.error = reason;
				});
		});

		socket.on(SocketActions.proposeTrade, (action: ProposeTradeAction) => {
			const mapped = {
				player: action.parameters.playerName,
				wants: action.parameters.wantsResources,
				resources: action.parameters.resources
			};
			uiStore.setProposesTrade(mapped);
		});

		this.socketListenersBound = true;
		return socket;
	}

	async startGame(pointsToWin: number): Promise<void> {
		const socket = socketManager.connect();
		socket.emit(SocketActions.lockMap, pointsToWin);
	}

	async updateMap(map: Tile[]): Promise<void> {
		const socket = socketManager.connect();
		socket.emit(SocketActions.newMap, map);
	}

	async sendAction(action: GameAction): Promise<void> {
		const socket = socketManager.connect();
		socket.emit(SocketActions.sendAction, action);
	}

	async proposeTrade(action: ProposeTradeAction): Promise<void> {
		const socket = socketManager.connect();
		socket.emit(SocketActions.proposeTrade, action);
	}

	async createGame(playerName: string): Promise<void> {
		const host = env.PUBLIC_SERVER;
		console.log('Creating game at host:', host);
		const response = await fetch(`${host}/newgame`);
		const { id }: { id: string } = await response.json();
		console.log(`Created game with ID: ${id}`);

		const socket = socketManager.connect(`${host}/${id}`);
		this.bindToWorld();
		socket.emit(SocketActions.join, playerName);
		socket.emit(SocketActions.getWorld);

		this.gameId = id;
		this.playerName = playerName;
		this.persistSession({ gameId: id, playerName });
	}

	async joinGame(gameId: string, playerName?: string): Promise<void> {
		const resolvedPlayerName = this.resolvePlayerName(gameId, playerName);
		if (!resolvedPlayerName) {
			this.error = 'A player name is required to join this game.';
			return;
		}

		this.error = undefined;

		const host = env.PUBLIC_SERVER;
		const response = await fetch(
			`${host}/joingame?gameId=${encodeURIComponent(gameId)}&playerName=${encodeURIComponent(resolvedPlayerName)}`
		);
		const data: Result = await response.json();

		const flatmappable = toResultInstance(data);
		flatmappable.flatMap((world: World) => {
			const socket = socketManager.connect(`${host}/${gameId}`);
			this.bindToWorld();
			socket.emit(SocketActions.join, resolvedPlayerName);
			socket.emit(SocketActions.getWorld);

			this.gameId = gameId;
			this.playerName = resolvedPlayerName;
			this.world = world;
			this.persistSession({ gameId, playerName: resolvedPlayerName });
			return success(world);
		});

		flatmappable.onFailure((reason: string) => {
			this.error = reason;
		});
	}

	setPointsToWin(points: number) {
		this.pointsToWin = points;
		if (this.world) {
			this.world = { ...this.world, pointsToWin: points };
		}
	}

	getPlayer(name: string): Player | undefined {
		return this.world?.players.find((player) => player.name === name);
	}

	getPlayerColorAsHex(name: string): string | undefined {
		const color = this.world?.players.find((player) => player.name === name)?.color;
		if (color === undefined) {
			return undefined;
		}
		return `#${(color >>> 0).toString(16).padStart(6, '0')}`;
	}

	reset() {
		this.gameId = undefined;
		this.playerName = undefined;
		this.pointsToWin = DEFAULT_POINTS_TO_WIN;
		this.world = undefined;
		this.error = undefined;
		socketManager.disconnect();
		this.clearSession();
		this.socketListenersBound = false;
	}

	getStoredSession() {
		return this.readSession();
	}
}

export const gameStore = new GameStore();
