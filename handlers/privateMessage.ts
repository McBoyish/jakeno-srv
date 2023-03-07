import { ObjectId } from 'mongodb';
import { Socket } from 'socket.io';
import { collection } from '../utils/database';
import { InputPrivateMessage, PrivateMessage, User } from '../types';

export const registerPrivateMessageHandlers = (socket: Socket) => {
	const privateMessage = async (
		input: InputPrivateMessage,
		receiver: User,
		callback: (res: PrivateMessage) => void
	) => {
		try {
			const data: PrivateMessage = {
				_id: new ObjectId().toString(),
				convId: input.convId,
				content: input.content,
				user: input.user,
				createdAt: new Date().toISOString(),
			};
			await collection<PrivateMessage>('privateMessages').insertOne(data);
			callback(data);
			socket.to(receiver.name).emit('private-message', data);
		} catch (e) {
			callback(null);
			socket.to(receiver.name).emit('private-message', null);
		}
	};

	socket.on('private-message', privateMessage);
};
