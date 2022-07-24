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

const roomRouter = express.Router();

roomRouter.get('/exists/:name', async (req, res, next) => {
	try {
		const roomCollection: Collection<Room> = db.collection('rooms');
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

roomRouter.get('/is-locked/:name', async (req, res, next) => {
	try {
		const roomCollection: Collection<Room> = db.collection('rooms');
		const room = await roomCollection.findOne({ name: req.params.name });

		if (!room) {
			res.json(null);
			return;
		}

		res.json({ locked: room.locked });
	} catch (e) {
		next(new Error('unknown-error'));
	}
});

roomRouter.post('/verify-code/:name', async (req, res, next) => {
	try {
		const roomCollection: Collection<Room> = db.collection('rooms');
		const room = await roomCollection.findOne({ name: req.params.name });
		const code = req.body.code;

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
		const roomCollection: Collection<Room> = db.collection('rooms');
		const room = await roomCollection.findOne({ name: req.params.name });
		const roomNoCode = { ...room, code: undefined } as Omit<Room, 'code'>;

		if (!room) {
			res.json(null);
			return;
		}

		if (room.locked && req.body.code !== room.code) {
			next(new Error('invalid-room-code'));
			return;
		}

		const messageCollection: Collection<Message> = db.collection('messages');
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
			const { name, description, locked, code, userId } = req.body as InputRoom;
			const roomCollection: Collection<Room> = db.collection('rooms');
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
				locked,
				code,
				createdAt: new Date().toISOString(),
			};
			await roomCollection.insertOne(data);

			const roomData: RoomData = {
				_id: data._id,
				userId,
				name,
				description,
				locked,
				messages: [],
				createdAt: data.createdAt,
			};
			res.json(roomData);
		} catch (e) {
			next(new Error('unknown-error'));
		}
	}
);

export { roomRouter };
