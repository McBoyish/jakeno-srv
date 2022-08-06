import { HOME } from '../utils/config';
import { io } from '..';
import { LiveRoom } from '../types';
import { Server, Socket } from 'socket.io';

const getLiveRooms = async (io: Server) => {
	const sockets = await io.fetchSockets();
	const liveRoomMap: Record<string, LiveRoom> = {};
	for (const socket of sockets) {
		if (socket.data.room && !socket.data.room.isPrivate) {
			const room = socket.data.room;
			const liveRoom = liveRoomMap[room.name];
			const activeUsers = liveRoom ? liveRoom.activeUsers + 1 : 1;
			liveRoomMap[room.name] = { ...room, activeUsers };
		}
	}
	return Object.values(liveRoomMap);
};

export const registerHomeHandlers = (socket: Socket) => {
	const updateLiveRooms = async (callback: (liveRooms: LiveRoom[]) => void) => {
		const liveRooms = await getLiveRooms(io);
		callback(liveRooms);
	};

	const joinHome = async (callback: (liveRooms: LiveRoom[]) => void) => {
		socket.join(HOME);
		const liveRooms = await getLiveRooms(io);
		callback(liveRooms);
	};

	const leaveHome = async () => {
		socket.leave(HOME);
	};

	const disconnecting = async () => {
		await leaveHome();
	};

	socket.on('update-live-rooms', updateLiveRooms);
	socket.on('join-home', joinHome);
	socket.on('leave-home', leaveHome);
	socket.on('disconnecting', disconnecting);
};
