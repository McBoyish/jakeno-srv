import { ObjectId } from 'mongodb';
import { Socket } from 'socket.io';
import { collection } from '../utils/database';
import { InputMessage, Message } from '../types';

export const registerMessageHandlers = (socket: Socket) => {
	const message = async (
		input: InputMessage,
		callback: (res: Message) => void
	) => {
		try {
			const maxLength = 1000;
			const data: Message = {
				_id: new ObjectId().toString(),
				roomId: input.roomId,
				content: input.content.slice(0, maxLength),
				user: input.user,
				createdAt: new Date().toISOString(),
			};
			await collection<Message>('messages').insertOne(data);
			callback(data);
			socket.to(input.roomName).emit('message', data);
		} catch (e) {
			callback(null);
			socket.to(input.roomName).emit('message', null);
		}
	};

	socket.on('message', message);
};
