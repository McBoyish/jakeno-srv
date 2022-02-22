import { PORT, ORIGIN } from './utils/config';
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { registerRoomHandlers } from './handlers/room';
import { registerMessageHandlers } from './handlers/message';
import { app } from './app';
import { db } from './utils/database';

const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: ORIGIN || 'http://localhost:3000',
	},
});

io.on('connection', (socket: Socket) => {
	console.log('connected');
	registerRoomHandlers(io, socket, db);
	registerMessageHandlers(io, socket, db);
});

httpServer.listen(PORT || 4000);
