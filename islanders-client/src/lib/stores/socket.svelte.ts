import type { Socket as SocketIO } from 'socket.io-client';
import { io } from 'socket.io-client';
import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

const STORAGE_KEY = 'islanders:socket:path';

class Socket {
	private socket: SocketIO | undefined = $state(undefined);
	private lifecycleListenersAttached = false;
	private defaultHost = env.PUBLIC_SERVER ?? 'http://localhost:3002';
	private namespaceGameId: string | undefined = undefined;
	private pendingNamespace: string | undefined = undefined;
	private readyCallbacks: Array<() => void> = [];

	connected = $state(false);
	connecting = $state(false);
	error = $state<string | undefined>(undefined);
	path = $state<string | null>(null);
	reconnectAttempts = $state(0);
	socketId = $state<string | undefined>(undefined);

	private persistPath(path: string) {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, path);
		} catch (err) {
			console.warn('Unable to persist socket path', err);
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

	private attachLifecycleListeners(instance: SocketIO) {
		if (this.lifecycleListenersAttached) {
			return;
		}
		this.lifecycleListenersAttached = true;

		instance.on('connect', () => {
			this.connected = true;
			this.connecting = false;
			this.error = undefined;
			this.path = this.pendingNamespace ?? this.path ?? null;
			this.reconnectAttempts = 0;
			this.socketId = instance.id;
		});

		instance.on('disconnect', (reason: string) => {
			this.connected = false;
			this.connecting = false;
			this.error = reason == 'io client disconnect' ? undefined : reason;
			this.path = this.pendingNamespace ?? this.path ?? null;
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

	private ensureBaseSocket(): SocketIO {
		const path = this.restorePath() ?? this.defaultHost;
		if (!this.socket) {
			this.socket = io(path, {
				transports: ['websocket'],
				autoConnect: true,
				reconnection: true
			});
			this.persistPath(path);
			this.attachLifecycleListeners(this.socket);
		}
		return this.socket;
	}

	connectNamespace(gameId: string, onSocketRecreated?: () => void) {
		if (!gameId) return;
		const target = `${this.defaultHost}/${gameId}`;
		if (this.namespaceGameId === gameId && this.socket && this.path === target) {
			return;
		}
		// If a socket exists but path differs, reconnect to namespace
		const isRecreating = !!this.socket;
		if (this.socket) {
			try {
				this.socket.disconnect();
			} catch (err) {
				console.warn('Error disconnecting old socket', err);
			}
			this.socket = undefined;
		}
		this.namespaceGameId = gameId;
		this.pendingNamespace = target;
		this.socket = io(target, {
			transports: ['websocket'],
			autoConnect: true,
			reconnection: true
		});
		this.persistPath(target);
		this.lifecycleListenersAttached = false;
		this.attachLifecycleListeners(this.socket);

		// Notify caller that socket was recreated so they can rebind listeners
		if (isRecreating && onSocketRecreated) {
			onSocketRecreated();
		}
	}

	onReady(cb: () => void) {
		if (this.connected) {
			cb();
			return;
		}
		this.readyCallbacks.push(cb);
	}

	disconnect() {
		if (this.socket && this.socket.connected) {
			this.socket.disconnect();
		}
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

	getSocket(): SocketIO | undefined {
		return this.socket ?? this.ensureBaseSocket();
	}

	ensureGame(gameId?: string, onSocketRecreated?: () => void) {
		if (gameId) {
			this.connectNamespace(gameId, onSocketRecreated);
		} else {
			this.ensureBaseSocket();
		}
	}
}

export const socket = new Socket();

// Initialize base socket immediately so components can rely on availability
if (typeof window !== 'undefined') {
	socket.getSocket();
}
