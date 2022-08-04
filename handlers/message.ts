import { Db, ObjectId } from 'mongodb';
import { Server, Socket } from 'socket.io';
import { InputMessage, Message, Room, User } from '../types';

export const registerMessageHandlers = (io: Server, socket: Socket, db: Db) => {
	const message = async (
		message: InputMessage,
		callback: (res: Message) => void
	) => {
		const messages = db.collection<Message>('messages');
		const users = db.collection<User>('users');
		const rooms = db.collection<Room>('rooms');

		const user = await users.findOne({ _id: message.userId });

		// edge case, should not happen normally
		if (!user && message.userId !== 'anon') return;

		const data: Message = {
			_id: new ObjectId().toString(),
			roomId: message.roomId,
			content: message.content,
			user: user || {
				name: 'anon',
				_id: 'anon',
			},
			createdAt: new Date().toISOString(),
		};

		await messages.insertOne(data);
		const room = await rooms.findOne({ _id: message.roomId });

		socket.to(room.name).emit('message', data);
		callback(data);
	};

	socket.on('message', message);
};
