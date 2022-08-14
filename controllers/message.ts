import express from 'express';
import { findOne, find } from '../utils/database';
import { Message, Room } from '../types';

export const messageRouter = express.Router();

messageRouter.post('/', async (req, res, next) => {
	try {
		const { roomName, code } = req.body as { roomName: string; code: string };
		const room = await findOne<Room>('rooms', { name: roomName });
		if (room.code !== code) res.json(null);
		const messages = await find<Message>(
			'messages',
			{ roomId: room._id },
			{ sort: { _id: -1 } }
		);
		res.json(messages);
	} catch (e) {
		next(new Error('unknown-error'));
	}
});
