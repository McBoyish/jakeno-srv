import express from 'express';
import { ObjectId } from 'mongodb';
import { collection } from '../utils/database';
import { InputRoom, Room, AuthRequest, RoomNoCode } from '../types';
import { verifyToken } from '../utils/middlewares';

export const roomRouter = express.Router();

const findRoom = async (name: string) => {
	return await collection<Room>('rooms').findOne({
		name,
	});
};

roomRouter.get('/', async (_, res, next) => {
	try {
		const rooms = (await collection<Room>('rooms')
			.find({ code: '' }, { projection: { code: 0 } })
			.toArray()) as RoomNoCode[];
		res.json(rooms);
	} catch (e) {
		next(new Error('unknown-error'));
	}
});

roomRouter.get('/exists/:name', async (req, res, next) => {
	try {
		const room = await findRoom(req.params.name);
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
		const room = await findRoom(req.params.name);
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
		const room = await findRoom(req.params.name);
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
		const room = await findRoom(req.params.name);
		const roomNoCode = { ...room, code: undefined } as RoomNoCode;
		if (!room) {
			res.json(null);
			return;
		}
		if (code !== room.code) {
			next(new Error('invalid-room-code'));
			return;
		}
		res.json(roomNoCode);
	} catch (e) {
		next(new Error('unknown-error'));
	}
});

roomRouter.post('/', verifyToken, async (req: AuthRequest, res, next) => {
	try {
		const { name, description, code } = req.body as InputRoom;
		const room = await findRoom(name);
		if (room) {
			res.json(null);
			return;
		}
		const data: Room = {
			_id: new ObjectId().toString(),
			user: req.user,
			name,
			description,
			code,
			isPrivate: code !== '',
			createdAt: new Date().toISOString(),
		};
		await collection<Room>('rooms').insertOne(data);
		const roomNoCode = { ...data, code: undefined } as RoomNoCode;
		res.json(roomNoCode);
	} catch (e) {
		next(new Error('unknown-error'));
	}
});
