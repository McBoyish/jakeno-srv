require('dotenv').config();
const { MongoClient } = require('mongodb');
const cuid = require('cuid');
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

	io.on('connection', socket => {
		socket.on('get-room-id', async (name, callback) => {
			const rooms = db.collection('rooms');
			const room = await rooms.findOne({ name });
			if (room) {
				callback(room.roomId);
				return;
			}
			const data = {
				roomId: cuid().toString(),
				name: name,
			};
			await rooms.insertOne(data);
			callback(data.roomId);
		});
		socket.on('join-room', async roomId => {
			socket.join(roomId);
			const messages = await db
				.collection('messages')
				.find({ roomId })
				.toArray();
			socket.emit('join', messages.reverse());
		});
		socket.on('leave-room', roomId => {
			socket.leave(roomId);
		});
		socket.on('message', async (roomId, message) => {
			await db.collection('messages').insertOne({
				...message,
				roomId,
			});
			socket.to(roomId).emit('message', message);
		});
	});
}

run();

// const rooms = [
// 	{
// 		roomId: 'id',
// 		name: 'test',
// 	},
// ];
// let messages = [
// 	{
// 		content: 'test',
// 		user: 'test',
// 		roomId: 'id',
// 	},
// ];
