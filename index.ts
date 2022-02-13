require('dotenv').config();
import { Collection, MongoClient, ObjectId } from 'mongodb';
import { Server, Socket } from 'socket.io';
import { Room, Message, User, InputMessage, MessageField } from './types';
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
				userName: string,
				roomName: string,
				callback: (userId: string, roomId: string) => void
			) => {
				const userCollection: Collection<User> = db.collection('users');
				const roomCollection: Collection<Room> = db.collection('rooms');
				const user = await userCollection.findOne({ name: userName });
				const room = await roomCollection.findOne({ name: roomName });
				let userId = '';
				let roomId = '';
				if (user) userId = user._id;
				else {
					const res = await userCollection.insertOne({
						_id: new ObjectId().toString(),
						name: userName,
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
			const userCollection: Collection<User> = db.collection('users');
			const roomCollection: Collection<Room> = db.collection('rooms');
			const user = await userCollection.findOne({ _id: userId });
			const room = await roomCollection.findOne({ _id: roomId });
			if (!user || !room || !userId || !roomId) {
				// user entered room using query parameters (not allowed)
				socket.emit('join-room-error');
				return;
			}
			socket.join(roomId);
			const messageCollection: Collection<Message> = db.collection('messages');
			// can be refactored in the future
			const messages = await messageCollection.find({ roomId }).toArray();
			const users = await userCollection.find({}).toArray();
			const res: MessageField[] = messages.map(message => {
				const user = users.find(user => user._id === message.userId);
				return {
					date: message.date,
					content: message.content,
					userName: user.name,
				};
			});
			socket.emit('join-room-success', res);
		});
		socket.on('leave-room', (roomId: string) => {
			socket.leave(roomId);
		});
		socket.on(
			'message',
			async (message: InputMessage, callback: (res: MessageField) => void) => {
				const messageCollection: Collection<Message> =
					db.collection('messages');
				const userCollection: Collection<User> = db.collection('users');
				const data = {
					_id: new ObjectId().toString(),
					date: new Date().toISOString(),
					userId: message.userId,
					roomId: message.roomId,
					content: message.content,
				};
				await messageCollection.insertOne(data);
				const user = await userCollection.findOne({ _id: data.userId });
				const res: MessageField = {
					date: data.date,
					content: data.content,
					userName: user.name,
				};
				console.log(res);
				socket.to(message.roomId).emit('message', res);
				callback(res);
			}
		);
	});
}

run();
