import { Db, ObjectId } from 'mongodb';
import { Server, Socket } from 'socket.io';
import { InputMessage, Message } from '../types';

export const registerMessageHandlers = (_: Server, socket: Socket, db: Db) => {
	const message = async (
		message: InputMessage,
		callback: (res: Message) => void
	) => {
		const messages = db.collection<Message>('messages');
		const data: Message = {
			_id: new ObjectId().toString(),
			roomId: message.roomId,
			content: message.content,
			user: message.user,
			createdAt: new Date().toISOString(),
		};
		await messages.insertOne(data);
		callback(data);
		socket.to(message.roomName).emit('message', data);
	};

	socket.on('message', message);
};
