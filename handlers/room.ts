import { Db } from 'mongodb';
import { User } from '../types';
import { Server, Socket } from 'socket.io';

export const registerRoomHandlers = (io: Server, socket: Socket, _: Db) => {
	const joinRoom = async (
		room: string,
		user: User,
		callback: (users: User[]) => void
	) => {
		socket.data.room = room;
		socket.data.user = user;
		socket.join(room);

		const sockets = await io.in(room).fetchSockets();
		const users = sockets.map(socket => socket.data.user);
		callback(users);
		socket.to(room).emit('join-room', users);
	};

	const leaveRoom = async () => {
		const room = socket.data.room;
		socket.data.room = undefined;
		socket.data.user = undefined;
		socket.leave(room);

		const sockets = await io.in(room).fetchSockets();
		const users = sockets.map(socket => socket.data.user);
		socket.to(room).emit('leave-room', users);
	};

	const disconnecting = async () => {
		await leaveRoom();
	};

	socket.on('join-room', joinRoom);
	socket.on('disconnecting', disconnecting);
};
