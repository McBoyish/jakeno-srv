import { PORT, ORIGIN } from './utils/config';
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { roomHandler } from './handlers/roomHandler';
import { messageHandler } from './handlers/messageHandler';
import { app } from './app';
import { db } from './database';

const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: ORIGIN || 'http://localhost:3000',
	},
});

io.on('connection', (socket: Socket) => {
	console.log('connected');
	roomHandler(io, socket, db);
	messageHandler(io, socket, db);
});

httpServer.listen(PORT || 4000);
