type SocketLike = {
	emit: (event: string, ...args: unknown[]) => void;
	on: (event: string, callback: (...args: any[]) => void) => void;
};

export const SocketConnection: { socket?: SocketLike } = {
	socket: undefined
};

export function setSocket(socket: SocketLike) {
	SocketConnection.socket = socket;
}

export type { SocketLike };
