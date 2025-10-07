import { io, type Socket } from 'socket.io-client';
import { env } from '$env/dynamic/public';

const host = env.PUBLIC_SERVER ?? 'http://localhost:3002';

let socket: Socket | undefined = undefined;

export const connect = (path: string = host) => {
	if (!socket) {
		socket = io(path, { transports: ['websocket'] });
	}
	if (!socket.connected) {
		socket.connect();
	}

	return socket;
};

export const disconnect = () => {
	if (socket && socket.connected) {
		socket.disconnect();
	}
};
