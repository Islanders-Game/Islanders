import { writable } from 'svelte/store';
import type { ChatMessage } from '../../../../islanders-shared/lib/Shared';
import { SocketActions } from '../../../../islanders-shared/lib/Shared';
import { connect, getSocket } from './socket';
import { env } from '$env/dynamic/public';
import { gameState } from './game.svelte';

export interface ChatEntry extends ChatMessage {
	id: string;
	ts: number;
	pending?: boolean;
	self?: boolean;
}

interface ChatState {
	messages: ChatEntry[];
	initialized: boolean;
	error?: string;
}

const createInitial = (): ChatState => ({
	messages: [],
	initialized: false
});

const { subscribe, update, set } = writable<ChatState>(createInitial());
let listenersBound = false;
let lastChatPath: string | undefined = undefined;

const MAX_MESSAGES = 250;

export const chatStore = { subscribe };

const appendMessage = (msg: ChatEntry) => {
	update((state) => {
		const next = [...state.messages, msg];
		if (next.length > MAX_MESSAGES) next.splice(0, next.length - MAX_MESSAGES);
		return { ...state, messages: next };
	});
};

type OutgoingChatMessage = ChatMessage & { clientId?: string };

export const bindChat = (gameId?: string) => {
	// Always prefer connecting to the game namespace. If a gameId is provided (or already
	// present on gameState) we explicitly connect to that namespaced path so we don't
	// accidentally fall back to the root namespace which would prevent broadcast chat.
	const resolvedGameId = gameId || gameState.gameId;
	const host = env.PUBLIC_SERVER ?? 'http://localhost:3002';
	const path = resolvedGameId ? `${host}/${resolvedGameId}` : undefined;
	const socket = connect(path);
	lastChatPath = path;
	if (listenersBound) return socket;

	socket.on(SocketActions.chat, (incoming: ChatMessage & { clientId?: string }) => {
		update((state) => {
			let idx = -1;
			if (incoming.clientId) {
				idx = state.messages.findIndex((m) => m.id === incoming.clientId);
			}
			if (idx === -1) {
				idx = state.messages.findIndex(
					(m) => m.pending && m.text === incoming.text && m.user === incoming.user
				);
			}

			if (idx !== -1) {
				const copy = [...state.messages];
				copy[idx] = { ...copy[idx], pending: false, ts: copy[idx].ts };
				return { ...state, messages: copy };
			}

			const entry = {
				id: crypto.randomUUID(),
				ts: Date.now(),
				text: incoming.text,
				user: incoming.user,
				self: incoming.user === gameState.playerName,
				pending: false
			} as ChatEntry;
			const next = [...state.messages, entry];
			if (next.length > MAX_MESSAGES) next.splice(0, next.length - MAX_MESSAGES);
			return { ...state, messages: next };
		});
	});

	socket.on('connect_error', (err: Error) => {
		update((s) => ({ ...s, error: err.message }));
	});

	listenersBound = true;
	update((s) => ({ ...s, initialized: true }));
	return socket;
};

export const sendChat = (text: string) => {
	const trimmed = text.trim();
	if (!trimmed) return;
	const playerName = gameState.playerName || 'Unknown';
	const socket = getSocket();
	if (!socket || !socket.connected) {
		update((s) => ({ ...s, error: 'Not connected' }));
		return;
	}

	const clientId = crypto.randomUUID();
	const optimistic: ChatEntry = {
		id: clientId,
		ts: Date.now(),
		text: trimmed,
		user: playerName,
		pending: true,
		self: true
	};
	appendMessage(optimistic);
	const outgoing: OutgoingChatMessage = { text: trimmed, user: playerName, clientId };
	socket.emit(SocketActions.chat, outgoing as ChatMessage);
};

export const clearChat = () => set(createInitial());
