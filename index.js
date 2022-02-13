require('dotenv').config();
const { MongoClient } = require('mongodb');
const cuid = require('cuid');
const io = require('socket.io')(process.env.PORT || 4000, {
	cors: {
		origin: [process.env.HOST],
	},
});

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
await client.connect();
const db = client.db('randomstranger');

// interfaces
const rooms = [
	{
		roomId: 'id',
		name: 'test',
	},
];
let messages = [
	{
		content: 'test',
		user: 'test',
		roomId: 'id',
	},
];

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
		const messages = await db.collection('messages').find({ roomId }).toArray();
		socket.emit('join', messages);
	});
	socket.on('leave-room', roomId => {
		socket.leave(roomId);
	});
	socket.on('message', (roomId, message) => {
		await db.collection('messages').insertOne({
			...message,
			roomId,
		});
		socket.to(id).emit('message', message);
	});
});
