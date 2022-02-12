require('dotenv').config();
const io = require('socket.io')(process.env.PORT || 4000, {
	cors: {
		origin: ['http://localhost:3000'],
	},
});

const connections = [];
io.on('connection', socket => {
	socket.on('join-room', (usr, id) => {
		const self = {
			id: id,
			usr: usr,
			sId: null,
			sUsr: null,
		};
		for (const other of connections) {
			if (other.id !== self.id && !other.sId) {
				// pair the 2 connections
				other.sId = self.id;
				other.sUsr = self.usr;
				self.sId = other.id;
				self.sUsr = other.usr;
				break;
			}
		}
		connections.push(self);
		console.log(connections);
		console.log(socket.id);
		if (self.sId && self.sUsr) {
			// notify self and other
			socket.to(self.sId).emit('stranger-found', self.usr); // works
			socket.emit('stranger-found', self.sUsr); // doesnt work...
			return;
		}
		socket.emit('no-stranger-found');
	});
});
