import { Db } from 'mongodb';
import { User, Room } from '../types';
import { Server, Socket } from 'socket.io';
import { HOME } from '../utils/config';

export const registerRoomHandlers = (io: Server, socket: Socket, _: Db) => {
	const joinRoom = async (room: Room, callback: (users: User[]) => void) => {
		socket.data.room = room;
		socket.join(room.name);

		const sockets = await io.in(room.name).fetchSockets();
		const users = sockets.map(socket => socket.data.user);
		callback(users);
		socket.to(room.name).emit('join-room', users);
		socket.to(HOME).emit('joined-room', room.name);
	};

	const leaveRoom = async () => {
		const room = socket.data.room as Room;
		socket.data.room = null;
		socket.leave(room.name);

		const sockets = await io.in(room.name).fetchSockets();
		const users = sockets.map(socket => socket.data.user);
		socket.to(room.name).emit('leave-room', users);
		socket.to(HOME).emit('left-room', room.name);
	};

	const disconnecting = async () => {
		socket.data.room && (await leaveRoom());
	};

	socket.on('join-room', joinRoom);
	socket.on('leave-room', leaveRoom);
	socket.on('disconnecting', disconnecting);
};
