import express from 'express';
import { Collection, ObjectId } from 'mongodb';
import { db } from '../database';
import { Message, Room, ErrorType, RoomData } from '../types';

const roomRouter = express.Router();

roomRouter.get('/:name', async (req, res, next) => {
	try {
		const rooms: Collection<Room> = db.collection('rooms');
		const room = await rooms.findOne({ name: req.params.name });
		if (!room) {
			// if room does not exist, create new one
			const data: Room = {
				_id: new ObjectId().toString(),
				name: req.params.name,
			};
			await rooms.insertOne(data);
			const roomData: RoomData = { ...data, messages: [] };
			res.json(roomData);
			return;
		}
		// if room exists, respond with data
		const messages: Collection<Message> = db.collection('messages');
		const data = (await messages
			.aggregate([{ $match: { roomId: room._id } }])
			.toArray()) as Message[];
		const roomData: RoomData = { ...room, messages: data };
		res.json(roomData);
		return;
	} catch (e) {
		next(new Error(ErrorType.UNKNOWN_ERROR));
		return;
	}
});

export { roomRouter };
