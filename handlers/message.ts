import { ObjectId } from 'mongodb';
import { Socket } from 'socket.io';
import { insertOne } from '../utils/database';
import { InputMessage, Message } from '../types';

export const registerMessageHandlers = (socket: Socket) => {
	const message = async (
		input: InputMessage,
		callback: (res: Message) => void
	) => {
		const data: Message = {
			_id: new ObjectId().toString(),
			roomId: input.roomId,
			content: input.content,
			user: input.user,
			createdAt: new Date().toISOString(),
		};
		await insertOne<Message>('messages', data);
		callback(data);
		socket.to(input.roomName).emit('message', data);
	};

	socket.on('message', message);
};
