import { Db } from 'mongodb';
import { Server, Socket } from 'socket.io';

export const registerRoomHandlers = (_: Server, socket: Socket, __: Db) => {
	const joinRoom = async (roomId: string) => {
		if (!roomId) return;
		socket.join(roomId);
		// broadcast event to room
	};

	const leaveRoom = (roomId: string) => {
		if (!roomId) return;
		socket.leave(roomId);
		// broadcast event to room
	};

	socket.on('join-room', joinRoom);
	socket.on('leave-room', leaveRoom);
};
