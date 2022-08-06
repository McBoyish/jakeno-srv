import { User, RoomNoCode } from '../types';
import { Socket } from 'socket.io';
import { io } from '..';
import { HOME } from '../utils/config';

export const registerRoomHandlers = (socket: Socket) => {
	const joinRoom = async (
		room: RoomNoCode,
		callback: (users: User[]) => void
	) => {
		socket.data.room = room;
		socket.join(room.name);
		const sockets = await io.in(room.name).fetchSockets();
		const users = sockets.map(socket => socket.data.user) as User[];
		callback(users);
		socket.to(room.name).emit('join-room', users);
		socket.to(HOME).emit('joined-room');
	};

	const leaveRoom = async () => {
		const room = socket.data.room as RoomNoCode;
		socket.data.room = null;
		socket.leave(room.name);
		const sockets = await io.in(room.name).fetchSockets();
		const users = sockets.map(socket => socket.data.user);
		socket.to(room.name).emit('leave-room', users);
		socket.to(HOME).emit('left-room');
	};

	const disconnecting = async () => {
		socket.data.room && (await leaveRoom());
	};

	socket.on('join-room', joinRoom);
	socket.on('leave-room', leaveRoom);
	socket.on('disconnecting', disconnecting);
};
