import { writable } from 'svelte/store';
import type { ChatMessage } from '../../../../islanders-shared/lib/Shared';
import { SocketActions } from '../../../../islanders-shared/lib/Shared';
import { connect, getSocket } from './socket';
import { gameState } from './game.svelte';

// Shape of a client-side chat entry (can extend later for system events)
export interface ChatEntry extends ChatMessage {
	id: string; // unique client id
	ts: number; // timestamp (ms)
	pending?: boolean; // optimistic flag until echoed back
	self?: boolean; // whether authored by local player
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

const MAX_MESSAGES = 250;

export const chatStore = { subscribe };

const appendMessage = (msg: ChatEntry) => {
	update((state) => {
		const next = [...state.messages, msg];
		// Keep within bound
		if (next.length > MAX_MESSAGES) next.splice(0, next.length - MAX_MESSAGES);
		return { ...state, messages: next };
	});
};

// We augment outgoing chat messages with a clientId so we can reconcile the echo from server.
// The server ignores extra fields, so this is safe.
type OutgoingChatMessage = ChatMessage & { clientId?: string };

export const bindChat = () => {
	const socket = connect(); // ensures connection (will reuse existing)
	if (listenersBound) return socket;

	socket.on(SocketActions.chat, (incoming: ChatMessage & { clientId?: string }) => {
		update((state) => {
			// Try to find optimistic entry by clientId first
			let idx = -1;
			if (incoming.clientId) {
				idx = state.messages.findIndex((m) => m.id === incoming.clientId);
			}
			// Fallback: match first pending with same user+text
			if (idx === -1) {
				idx = state.messages.findIndex(
					(m) => m.pending && m.text === incoming.text && m.user === incoming.user
				);
			}

			if (idx !== -1) {
				const copy = [...state.messages];
				copy[idx] = { ...copy[idx], pending: false, ts: copy[idx].ts }; // keep original timestamp
				return { ...state, messages: copy };
			}

			// Otherwise append as a new (non-duplicate) message
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
