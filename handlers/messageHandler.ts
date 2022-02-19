import { Collection, Db, ObjectId } from 'mongodb';
import { Server, Socket } from 'socket.io';
import { InputMessage, Message, User } from '../types';

export const messageHandler = (io: Server, socket: Socket, db: Db) => {
	const message = async (
		message: InputMessage,
		callback: (res: Message) => void
	) => {
		const messages: Collection<Message> = db.collection('messages');
		const users: Collection<User> = db.collection('users');
		const user = await users.findOne({ _id: message.userId });
		if (!user) return;
		const data: Message = {
			_id: new ObjectId().toString(),
			roomId: message.roomId,
			content: message.content,
			user: user,
			date: new Date().toISOString(),
		};
		await messages.insertOne(data);
		socket.to(message.roomId).emit('message', data);
		callback(data);
	};

	socket.on('message', message);
};
