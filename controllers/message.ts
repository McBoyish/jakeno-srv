import express from 'express';
import { collection } from '../utils/database';
import { Message, Room } from '../types';

export const messageRouter = express.Router();

messageRouter.post('/', async (req, res, next) => {
	try {
		const { roomName, code, cursor } = req.body as {
			roomName: string;
			code: string;
			cursor: string;
		};
		const room = await collection<Room>('rooms').findOne({ name: roomName });
		if (room.code !== code) res.json(null);
		const findCursor = collection<Message>('messages').find({
			roomId: room._id,
		});
		if (cursor !== '') {
			findCursor.filter({ _id: { $lt: cursor } });
		}
		const messages = await findCursor.sort({ _id: -1 }).limit(50).toArray();
		res.json(messages);
	} catch (e) {
		next(new Error('unknown-error'));
	}
});
