import { PORT, ORIGIN } from './utils/config';
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { registerRoomHandlers } from './handlers/room';
import { registerMessageHandlers } from './handlers/message';
import { app } from './app';
import { User } from './types';
import { registerHomeHandlers } from './handlers/home';
import { registerPrivateMessageHandlers } from './handlers/privateMessage';

const httpServer = createServer(app);
export const io = new Server(httpServer, {
	cors: {
		origin: ORIGIN || 'http://localhost:3000',
	},
});

io.on('connection', (socket: Socket) => {
	socket.on('login', (user: User) => {
		socket.data.user = user;
		socket.join(user.name);
	});
	socket.on('logout', () => {
		if (socket.data.user) socket.leave(socket.data.user.name);
		socket.data.user = { name: 'anon', _id: 'anon' };
	});
	registerRoomHandlers(socket);
	registerMessageHandlers(socket);
	registerHomeHandlers(socket);
	registerPrivateMessageHandlers(socket);
});

httpServer.listen(PORT || 8080);
