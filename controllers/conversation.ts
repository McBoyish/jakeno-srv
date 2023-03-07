// send pm -> user, other user, find conv with both participant, if found return conv, query private messages, display
// if no conv found, create new one, return
import express from 'express';
import { ObjectId } from 'mongodb';
import { collection } from '../utils/database';
import { AuthRequest, Conversation, InputConv, User } from '../types';
import { verifyToken } from '../utils/middlewares';

export const convRouter = express.Router();

const findConvs = async (user: User) => {
	return await collection<Conversation>('conversations')
		.find({
			participants: { $elemMatch: { _id: user._id } },
		})
		.toArray();
};

const findConvByParticipants = async (users: string[]) => {
	return await collection<Conversation>('conversations').findOne({
		participants: users,
	});
};

const insertConv = async (conv: Conversation) => {
	return await collection<Conversation>('conversations').insertOne(conv);
};

convRouter.get('/', verifyToken, async (req: AuthRequest, res, next) => {
	try {
		const convs = await findConvs(req.user);
		return convs;
	} catch (e) {
		next(new Error('unknown-error'));
	}
});

convRouter.post('/', verifyToken, async (req: AuthRequest, res, next) => {
	try {
		const { participants } = req.body as InputConv;
		const conv = await findConvByParticipants(participants);

		if (conv) {
			res.json(null);
			return;
		}

		const data: Conversation = {
			_id: new ObjectId().toString(),
			participants,
			createdAt: new Date().toISOString(),
		};

		await insertConv(data);
		res.json(data);
	} catch (e) {
		next(new Error('unknown-error'));
	}
});
