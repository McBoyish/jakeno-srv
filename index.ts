import { PORT, ORIGIN } from './utils/config';
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { registerRoomHandlers } from './handlers/room';
import { registerMessageHandlers } from './handlers/message';
import { app } from './app';
import { User } from './types';
import { registerHomeHandlers } from './handlers/home';

const httpServer = createServer(app);
export const io = new Server(httpServer, {
	cors: {
		origin: ORIGIN || 'http://localhost:3000',
	},
});

io.on('connection', (socket: Socket) => {
	socket.on('login', (user: User) => {
		socket.data.user = user;
	});
	socket.on('logout', () => {
		socket.data.user = { name: 'anon', _id: 'anon' };
	});
	registerRoomHandlers(socket);
	registerMessageHandlers(socket);
	registerHomeHandlers(socket);
});

httpServer.listen(PORT || 8080);
