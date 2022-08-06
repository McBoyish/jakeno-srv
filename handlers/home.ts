import { Db } from 'mongodb';
import { HOME } from '../utils/config';
import { LiveRoom } from '../types';
import { Server, Socket } from 'socket.io';

export const registerHomeHandlers = (io: Server, socket: Socket, db: Db) => {
	const updateLiveRooms = async (callback: (liveRooms: LiveRoom[]) => void) => {
		const sockets = await io.fetchSockets();

		// count active users in each room
		const liveRoomMap: Record<string, LiveRoom> = {};
		for (const socket of sockets) {
			if (socket.data.room) {
				const room = socket.data.room;
				const liveRoom = liveRoomMap[room.name];
				const activeUsers = liveRoom ? liveRoom.activeUsers + 1 : 1;
				liveRoomMap[room.name] = { ...room, activeUsers };
			}
		}

		const liveRooms = Object.values(liveRoomMap);
		callback(liveRooms);
	};

	const joinHome = async (callback: (liveRooms: LiveRoom[]) => void) => {
		socket.join(HOME);
		const sockets = await io.fetchSockets();

		// count active users in each room
		const liveRoomMap: Record<string, LiveRoom> = {};
		for (const socket of sockets) {
			if (socket.data.room) {
				const room = socket.data.room;
				const liveRoom = liveRoomMap[room.name];
				const activeUsers = liveRoom ? liveRoom.activeUsers + 1 : 1;
				liveRoomMap[room.name] = { ...room, activeUsers };
			}
		}

		const liveRooms = Object.values(liveRoomMap);
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
