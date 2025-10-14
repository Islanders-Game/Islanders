import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

const STORAGE_KEY = 'islanders:socket:path';

class SocketManager {
	private socket: Socket | undefined = $state(undefined);
	private currentPath: string | undefined = $state(undefined);
	private lifecycleListenersAttached = false;
	private defaultHost = env.PUBLIC_SERVER ?? 'http://localhost:3002';

	connected = $state(false);
	connecting = $state(false);
	error = $state<string | undefined>(undefined);
	path = $state<string | null>(null);
	reconnectAttempts = $state(0);
	socketId = $state<string | undefined>(undefined);

	private rememberPath(path: string) {
		this.currentPath = path;
		if (browser) {
			try {
				localStorage.setItem(STORAGE_KEY, path);
			} catch (err) {
				console.warn('Unable to persist socket path', err);
			}
		}
	}

	private restorePath(): string | undefined {
		if (!browser) return undefined;
		try {
			return localStorage.getItem(STORAGE_KEY) ?? undefined;
		} catch (err) {
			console.warn('Unable to restore socket path', err);
			return undefined;
		}
	}

	private attachLifecycleListeners(instance: Socket) {
		if (this.lifecycleListenersAttached) {
			return;
		}
		this.lifecycleListenersAttached = true;

		instance.on('connect', () => {
			this.connected = true;
			this.connecting = false;
			this.error = undefined;
			this.path = this.currentPath ?? null;
			this.reconnectAttempts = 0;
			this.socketId = instance.id;
		});

		instance.on('disconnect', (reason: string) => {
			this.connected = false;
			this.connecting = false;
			this.error = reason == 'io client disconnect' ? undefined : reason;
			this.path = this.currentPath ?? null;
			this.reconnectAttempts = 0;
			this.socketId = undefined;
		});

		instance.on('connect_error', (err: Error) => {
			this.connecting = false;
			this.error = err.message ?? 'Connection error';
		});

		instance.io.on('reconnect_attempt', (attempt: number) => {
			this.connecting = true;
			this.reconnectAttempts = attempt;
		});

		instance.io.on('reconnect', () => {
			this.connecting = false;
			this.error = undefined;
			this.reconnectAttempts = 0;
		});
	}

	private initializeSocket(path: string): Socket {
		const needNew = !this.socket || this.currentPath !== path;
		if (needNew) {
			if (this.socket) {
				try {
					this.socket.disconnect();
				} catch (err) {
					console.warn('Error disconnecting previous socket', err);
				}
			}
			this.socket = io(path, {
				transports: ['websocket'],
				autoConnect: false,
				reconnection: true
			});
			this.rememberPath(path);
			this.lifecycleListenersAttached = false;
		}
		this.attachLifecycleListeners(this.socket!);
		return this.socket!;
	}

	connect(path?: string): Socket {
		const target = path ?? this.currentPath ?? this.restorePath() ?? this.defaultHost;

		const inst = this.initializeSocket(target);

		this.path = target;
		this.connecting = !inst.connected;

		if (!inst.connected) {
			inst.connect();
		}

		return inst;
	}

	disconnect() {
		if (this.socket && this.socket.connected) {
			this.socket.disconnect();
		}
		this.currentPath = undefined;
		this.lifecycleListenersAttached = false;
		this.connected = false;
		this.connecting = false;
		this.error = undefined;
		this.path = null;
		this.reconnectAttempts = 0;
		this.socketId = undefined;
		if (browser) {
			try {
				localStorage.removeItem(STORAGE_KEY);
			} catch (err) {
				console.warn('Unable to clear socket path', err);
			}
		}
	}

	getSocket(): Socket | undefined {
		return this.socket;
	}
}

export const socketManager = new SocketManager();
