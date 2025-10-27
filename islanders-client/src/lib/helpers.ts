import { getSocket, getWorld } from './stores/socket.svelte';
import { Player, SocketActions } from '../../../islanders-shared/lib/Shared';
import { playerName } from './stores/game.svelte';

export const sendMessage = (text: string) => {
	const trimmed = text.trim();
	if (!trimmed) return;

	const outgoing = { text: trimmed, user: playerName };
	getSocket()?.emit(SocketActions.chat, outgoing);
};

export const getPlayerColorAsHex = (name: string): string | undefined => {
	const color = getWorld()?.players.find((player: Player) => player.name === name)?.color;
	if (color === undefined) {
		return undefined;
	}
	return `#${(color >>> 0).toString(16).padStart(6, '0')}`;
};
