import { Collection, Db, ObjectId } from 'mongodb';
import { Server, Socket } from 'socket.io';
import { User, Room, Message } from '../types';

export const roomHandler = (io: Server, socket: Socket, db: Db) => {
	const joinRoomRequest = async (
		username: string,
		roomName: string,
		callback: (userId: string, roomId: string) => void
	) => {
		const userCollection: Collection<User> = db.collection('users');
		const roomCollection: Collection<Room> = db.collection('rooms');
		const user = await userCollection.findOne({ name: username });
		const room = await roomCollection.findOne({ name: roomName });
		let userId = '';
		let roomId = '';
		if (user) userId = user._id;
		else {
			const res = await userCollection.insertOne({
				_id: new ObjectId().toString(),
				name: username,
			});
			userId = res.insertedId;
		}
		if (room) roomId = room._id;
		else {
			const res = await roomCollection.insertOne({
				_id: new ObjectId().toString(),
				name: roomName,
			});
			roomId = res.insertedId;
		}
		callback(userId, roomId);
	};

	const joinRoom = async (userId: string, roomId: string) => {
		const users: Collection<User> = db.collection('users');
		const rooms: Collection<Room> = db.collection('rooms');
		const user = await users.findOne({ _id: userId });
		const room = await rooms.findOne({ _id: roomId });
		if (!user || !room || !userId || !roomId) {
			socket.emit('join-room-error');
			return;
		}
		socket.join(roomId);
		const messages: Collection<Message> = db.collection('messages');
		const data = (await messages
			.aggregate([{ $match: { roomId: roomId } }])
			.toArray()) as Message[];
		socket.emit('join-room-success', data);
	};

	const leaveRoom = (roomId: string) => {
		socket.leave(roomId);
		// broadcast event to room
	};

	socket.on('join-room-request', joinRoomRequest);
	socket.on('join-room', joinRoom);
	socket.on('leave-room', leaveRoom);
};
