require('dotenv').config();
import { Collection, MongoClient } from 'mongodb';
import cuid from 'cuid';
import { Socket } from 'socket.io';
import { Room, Message } from './types';
const io = require('socket.io')(process.env.PORT || 4000, {
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
		socket.on('get-room-id', async (roomName: string, callback: any) => {
			const rooms: Collection<Room> = db.collection('rooms');
			const room = await rooms.findOne({ roomName });
			if (room) {
				callback(room.roomId);
				return;
			}
			const data: Room = {
				roomId: cuid().toString(),
				roomName: roomName,
			};
			await rooms.insertOne(data);
			callback(data.roomId);
		});
		socket.on('join-room', async (roomId: string) => {
			socket.join(roomId);
			const allMessages: Collection<Message> = db.collection('messages');
			const messages = await allMessages.find({ roomId }).toArray();
			socket.emit('join', messages.reverse());
		});
		socket.on('leave-room', (roomId: string) => {
			socket.leave(roomId);
		});
		socket.on('message', async (roomId: string, message: Message) => {
			const messages: Collection<Message> = db.collection('messages');
			await messages.insertOne({
				...message,
				roomId,
			});
			socket.to(roomId).emit('message', message);
		});
	});
}

run();
