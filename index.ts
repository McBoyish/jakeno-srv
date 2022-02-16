require('dotenv').config();
import { Server, Socket } from 'socket.io';
import { MongoClient } from 'mongodb';
import { roomHandler } from './handlers/roomHandler';
import { messageHandler } from './handlers/messageHandler';
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
		roomHandler(io, socket, db);
		messageHandler(io, socket, db);
	});
}

run();
