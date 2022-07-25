import express from 'express';
import { Collection, ObjectId } from 'mongodb';
import { db } from '../utils/database';
import {
	InputRoom,
	Message,
	Room,
	RoomData,
	UserAuthInfoRequest,
} from '../types';
import { verifyToken } from '../utils/middlewares';

export const roomRouter = express.Router();

roomRouter.get('/exists/:name', async (req, res, next) => {
	try {
		const roomCollection = db.collection<Room>('rooms');
		const room = await roomCollection.findOne({ name: req.params.name });

		if (!room) {
			res.json({ exists: false });
			return;
		}

		res.json({ exists: true });
	} catch (e) {
		next(new Error('unknown-error'));
	}
});

roomRouter.get('/is-private/:name', async (req, res, next) => {
	try {
		const roomCollection = db.collection<Room>('rooms');
		const room = await roomCollection.findOne({ name: req.params.name });

		if (!room) {
			res.json(null);
			return;
		}

		res.json({ private: !!room.code });
	} catch (e) {
		next(new Error('unknown-error'));
	}
});

roomRouter.post('/verify-code/:name', async (req, res, next) => {
	try {
		const { code } = req.body as { code: string };

		const roomCollection = db.collection<Room>('rooms');
		const room = await roomCollection.findOne({ name: req.params.name });

		if (!room) {
			res.json(null);
			return;
		}

		res.json({ valid: code === room.code });
	} catch (e) {
		next(new Error('unknown-error'));
	}
});

roomRouter.post('/:name', async (req, res, next) => {
	try {
		const { code } = req.body as { code: string };

		const roomCollection = db.collection<Room>('rooms');
		const room = await roomCollection.findOne({ name: req.params.name });
		const roomNoCode = { ...room, code: undefined } as Omit<Room, 'code'>;

		if (!room) {
			res.json(null);
			return;
		}

		if (code !== room.code) {
			next(new Error('invalid-room-code'));
			return;
		}

		const messageCollection = db.collection<Message>('messages');
		const messages = (await messageCollection
			.aggregate([{ $match: { roomId: room._id } }])
			.toArray()) as Message[];

		const roomData = { ...roomNoCode, messages };
		res.json(roomData);
	} catch (e) {
		next(new Error('unknown-error'));
	}
});

roomRouter.post(
	'/',
	verifyToken,
	async (req: UserAuthInfoRequest, res, next) => {
		try {
			const { name, description, code, userId } = req.body as InputRoom;

			const roomCollection = db.collection<Room>('rooms');
			const room = await roomCollection.findOne({ name });

			if (room) {
				res.json(null);
				return;
			}

			const data: Room = {
				_id: new ObjectId().toString(),
				userId,
				name,
				description,
				code,
				createdAt: new Date().toISOString(),
			};
			await roomCollection.insertOne(data);

			const roomData: RoomData = {
				_id: data._id,
				userId,
				name,
				description,
				messages: [],
				createdAt: data.createdAt,
			};
			res.json(roomData);
		} catch (e) {
			next(new Error('unknown-error'));
		}
	}
);
