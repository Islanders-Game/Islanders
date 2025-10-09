import { io, type Socket } from 'socket.io-client';
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

const host = env.PUBLIC_SERVER ?? 'http://localhost:3002';
const STORAGE_KEY = 'islanders:socket:path';

type SocketStatus = {
	connected: boolean;
	connecting: boolean;
	error?: string;
	path: string | null;
	reconnectAttempts: number;
	socketId?: string;
};

const createInitialStatus = (): SocketStatus => ({
	connected: false,
	connecting: false,
	path: null,
	reconnectAttempts: 0
});

const { subscribe, update, set } = writable<SocketStatus>(createInitialStatus());

let socket: Socket | undefined = undefined;
let currentPath: string | undefined = undefined;
let lifecycleListenersAttached = false;

const rememberPath = (path: string) => {
	currentPath = path;
	if (browser) {
		try {
			localStorage.setItem(STORAGE_KEY, path);
		} catch (err) {
			console.warn('Unable to persist socket path', err);
		}
	}
};

const restorePath = (): string | undefined => {
	if (!browser) {
		return undefined;
	}

	try {
		return localStorage.getItem(STORAGE_KEY) ?? undefined;
	} catch (err) {
		console.warn('Unable to restore socket path', err);
		return undefined;
	}
};

const attachLifecycleListeners = (instance: Socket) => {
	if (lifecycleListenersAttached) {
		return;
	}

	instance.on('connect', () => {
		set({
			connected: true,
			connecting: false,
			error: undefined,
			path: currentPath ?? null,
			reconnectAttempts: 0,
			socketId: instance.id
		});
	});

	instance.on('disconnect', (reason) => {
		set({
			connected: false,
			connecting: false,
			error: reason === 'io client disconnect' ? undefined : reason,
			path: currentPath ?? null,
			reconnectAttempts: 0,
			socketId: undefined
		});
	});

	instance.on('connect_error', (error) => {
		update((status) => ({
			...status,
			connecting: false,
			error: error.message ?? 'Connection error'
		}));
	});

	instance.io.on('reconnect_attempt', (attempt: number) => {
		update((status) => ({
			...status,
			connecting: true,
			reconnectAttempts: attempt
		}));
	});

	instance.io.on('reconnect', () => {
		update((status) => ({
			...status,
			connecting: false,
			error: undefined,
			reconnectAttempts: 0
		}));
	});

	lifecycleListenersAttached = true;
};

const initializeSocket = (path: string): Socket => {
	if (!socket || currentPath !== path) {
		if (socket) {
			try {
				socket.disconnect();
			} catch (error) {
				console.warn('Error disconnecting previous socket', error);
			}
		}

		socket = io(path, {
			transports: ['websocket'],
			autoConnect: false,
			reconnection: true
		});
		rememberPath(path);
		lifecycleListenersAttached = false;
	}

	if (socket) {
		attachLifecycleListeners(socket);
	}

	return socket;
};

export const socketStore = { subscribe };

export const connect = (path?: string) => {
	const targetPath = path ?? currentPath ?? restorePath() ?? host;
	const instance = initializeSocket(targetPath);

	update((status) => ({
		...status,
		path: targetPath,
		connecting: !instance.connected
	}));

	if (!instance.connected) {
		instance.connect();
	}

	return instance;
};

export const disconnect = () => {
	if (socket && socket.connected) {
		socket.disconnect();
	}
	currentPath = undefined;
	lifecycleListenersAttached = false;
	set(createInitialStatus());
	if (browser) {
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch (err) {
			console.warn('Unable to clear socket path', err);
		}
	}
};

export const getSocket = () => socket;
