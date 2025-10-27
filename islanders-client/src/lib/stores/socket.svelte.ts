import { Socket as SocketIO } from 'socket.io-client';
import { io } from 'socket.io-client';
import { env } from '$env/dynamic/public';
import {
	type ChatMessage,
	fail,
	type Result,
	SocketActions,
	success,
	toResultInstance,
	World
} from '../../../../islanders-shared/lib/Shared';

let connected = $state(false);
let socket = $state<SocketIO | undefined>(undefined);
let world = $state<World | undefined>(undefined);
let error = $state<string | undefined>(undefined);
let chat = $state<ChatMessage[]>([]);

export const getConnected = () => connected;
export const getSocket = () => socket;
export const getWorld = () => world;
export const getError = () => error;
export const getChat = () => chat;

export const connect = (gameId: string): SocketIO => {
	const present =
		socket ??
		io(`${env.PUBLIC_SERVER ?? 'http://localhost:3002'}/${gameId}`, {
			transports: ['websocket'],
			autoConnect: true,
			reconnection: true
		});
	socket = present;

	present?.on('connect', () => {
		connected = true;
	});

	present?.on('disconnect', () => {
		connected = false;
	});
	present?.on('reconnect', () => {
		connected = true;
	});

	present.on(SocketActions.newWorld, (result: Result) => {
		console.debug('Received newWorld update from server', result);
		console.debug('Socket ID:', present.id, 'Connected:', present.connected);
		const asResultInstance = toResultInstance(result);
		asResultInstance
			.flatMap((w: World) => {
				world = w;
				return success(world);
			})
			.onFailure((reason: string) => {
				error = reason;
				return fail(reason);
			});
	});

	present.on(SocketActions.chat, (incoming: ChatMessage) => {
		chat = [...chat, incoming];
	});

	return present;
};
