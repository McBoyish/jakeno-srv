require('dotenv').config();
import { Collection, MongoClient, ObjectId } from 'mongodb';
import { Server, Socket } from 'socket.io';
import { Room, Message, User, InputMessage, OutputMessage } from './types';
const io: Server = require('socket.io')(process.env.PORT || 4000, {
	cors: {
		origin: [process.env.ORIGIN, 'http://localhost:3000'],
	},
});

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function run() {
	await client.connect();
	const db = client.db('randomstranger');

	io.on('connection', (socket: Socket) => {
		socket.on(
			'join-room-request',
			async (
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
			}
		);
		socket.on('join-room', async (userId: string, roomId: string) => {
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
			const res = (await messages
				.aggregate([
					{ $match: { roomId: roomId } },
					{ $project: { _id: 0, 'user._id': 0, roomId: 0 } },
				])
				.toArray()) as OutputMessage[];
			console.log(res);
			socket.emit('join-room-success', res);
		});
		socket.on('leave-room', (roomId: string) => {
			socket.leave(roomId);
			// broadcast event to room
		});
		socket.on(
			'message',
			async (message: InputMessage, callback: (res: OutputMessage) => void) => {
				const messages: Collection<Message> = db.collection('messages');
				const users: Collection<User> = db.collection('users');
				const user = await users.findOne({ _id: message.userId });
				const data: Message = {
					_id: new ObjectId().toString(),
					roomId: message.roomId,
					content: message.content,
					user: user,
					date: new Date().toISOString(),
				};
				await messages.insertOne(data);
				const res: OutputMessage = {
					content: data.content,
					user: {
						name: data.user.name,
					},
					date: data.date,
				};
				socket.to(message.roomId).emit('message', res);
				callback(res);
			}
		);
	});
}

run();
