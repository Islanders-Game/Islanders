import {
	SocketActions,
	success,
	toResultInstance,
	type Action as GameAction,
	type Result,
	type World,
	type Tile,
	Player,
	fail
} from '../../../../islanders-shared/lib/Shared.ts';
import type { ProposeTradeAction } from '../../../../islanders-shared/lib/Action.ts';

import { connect, getConnected, getSocket, getWorld } from './socket.svelte.ts';
import { env } from '$env/dynamic/public';

export let playerName: string | undefined;
const currentPlayer = $derived(
	getWorld()?.players.find((player: Player) => player.name === playerName)
);
const playerResources = $derived(
	currentPlayer?.resources ?? { wood: 0, clay: 0, stone: 0, grain: 0, wool: 0 }
);
const isCurrentTurn = $derived(getWorld()?.players.find((p) => p.name === currentPlayer?.name));

export const getCurrentPlayer = (): Player | undefined => {
	return currentPlayer;
};

export const getPlayerResources = () => {
	return playerResources;
};

export const getIsCurrentTurn = () => {
	return isCurrentTurn;
};
export const updateMap = async (map: Tile[]) => {
	getSocket()?.emit(SocketActions.newMap, map);
};

export const sendAction = (action: GameAction) => {
	getSocket()?.emit(SocketActions.sendAction, action);
	return Promise.resolve();
};

export const proposeTrade = (action: ProposeTradeAction) => {
	getSocket()?.emit(SocketActions.proposeTrade, action);
};

export const createGame = async (name: string) => {
	const host = env.PUBLIC_SERVER;
	console.log('Creating game at host:', host);
	const response = await fetch(`${host}/newgame`);
	const { id }: { id: string } = await response.json();
	console.log(`Created game with ID: ${id}`);

	connect(id);
	getSocket()?.emit(SocketActions.join, name);
	getSocket()?.emit(SocketActions.getWorld);

	playerName = name;

	return id;
};

export const joinGame = async (gameId: string, name: string) => {
	if (!name) {
		return fail('Player name is required to join a game');
	}

	const host = env.PUBLIC_SERVER;
	const response = await fetch(
		`${host}/joingame?gameId=${encodeURIComponent(gameId)}&playerName=${encodeURIComponent(name)}`
	);
	const data: Result = await response.json();

	const flatmappable = toResultInstance(data);
	const result = flatmappable.flatMap((world: World) => {
		if (!getConnected()) {
			connect(gameId);
		}

		getSocket()?.emit(SocketActions.join, name);
		getSocket()?.emit(SocketActions.getWorld);

		if (world) {
			playerName = name;
			return success(world);
		}

		return fail('Failed to join game');
	});

	return result;
};
