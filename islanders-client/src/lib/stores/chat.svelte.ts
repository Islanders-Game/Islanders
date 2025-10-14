import { browser } from '$app/environment';
import { socketManager } from './socket.svelte';
import { env } from '$env/dynamic/public';
import { gameStore } from './game.svelte';
import { SocketActions, type ChatMessage } from '../../../../islanders-shared/lib/Shared';

export interface ChatEntry extends ChatMessage {
	id: string;
	ts: number;
	pending?: boolean;
	self?: boolean;
}

const MAX_MESSAGES = 250;

class ChatStore {
	messages = $state<ChatEntry[]>([]);
	initialized = $state(false);
	error = $state<string | undefined>(undefined);

	private listenersBound = false;
	private lastChatPath: string | undefined;

	private ensureInit(gameId?: string) {
		if (!browser) return;
		this.bindChat(gameId);
	}

	private bindChat(gameId?: string) {
		const resolved = gameId ?? gameStore.gameId;
		const host = env.PUBLIC_SERVER ?? 'http://localhost:3002';
		const path = resolved ? `${host}/${resolved}` : undefined;

		if (this.listenersBound && path === this.lastChatPath) {
			return socketManager.getSocket();
		}

		const socket = socketManager.connect(path);
		this.lastChatPath = path;

		socket.on(SocketActions.chat, (incoming: ChatMessage & { clientId?: string }) => {
			const existing = this.messages;
			let idx = -1;
			if (incoming.clientId) {
				idx = existing.findIndex((m) => m.id === incoming.clientId);
			}
			if (idx === -1) {
				idx = existing.findIndex(
					(m) => m.pending && m.text === incoming.text && m.user === incoming.user
				);
			}
			if (idx !== -1) {
				const copy = [...existing];
				copy[idx] = {
					...copy[idx],
					pending: false,
					ts: copy[idx].ts
				};
				this.messages = copy;
			} else {
				const entry: ChatEntry = {
					id: crypto.randomUUID(),
					ts: Date.now(),
					text: incoming.text,
					user: incoming.user,
					self: incoming.user === gameStore.playerName,
					pending: false
				};
				const next = [...existing, entry];
				if (next.length > MAX_MESSAGES) {
					next.splice(0, next.length - MAX_MESSAGES);
				}
				this.messages = next;
			}
		});

		socket.on('connect_error', (err: Error) => {
			this.error = err.message;
		});

		this.listenersBound = true;
		this.initialized = true;

		return socket;
	}

	sendMessage(text: string) {
		const trimmed = text.trim();
		if (!trimmed) return;

		const socket = socketManager.getSocket();
		if (!socket || !socket.connected) {
			this.error = 'Not connected';
			return;
		}
		const playerName = gameStore.playerName ?? 'Unknown';
		const clientId = crypto.randomUUID();

		const optimistic: ChatEntry = {
			id: clientId,
			ts: Date.now(),
			text: trimmed,
			user: playerName,
			pending: true,
			self: true
		};
		{
			const existing = this.messages;
			const next = [...existing, optimistic];
			if (next.length > MAX_MESSAGES) {
				next.splice(0, next.length - MAX_MESSAGES);
			}
			this.messages = next;
		}

		const outgoing = { text: trimmed, user: playerName, clientId } as ChatMessage;
		socket.emit(SocketActions.chat, outgoing);
	}

	clear() {
		this.messages = [];
		this.initialized = false;
		this.error = undefined;
		this.listenersBound = false;
		this.lastChatPath = undefined;
	}

	init(gameId?: string) {
		this.ensureInit(gameId);
	}
}

export const chatStore = new ChatStore();
