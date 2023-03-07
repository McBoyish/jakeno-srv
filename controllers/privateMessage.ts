import express from 'express';
import { collection } from '../utils/database';
import { AuthRequest, Conversation, PrivateMessage } from '../types';
import { verifyToken } from '../utils/middlewares';

export const privateMessageRouter = express.Router();

privateMessageRouter.post(
	'/',
	verifyToken,
	async (req: AuthRequest, res, next) => {
		try {
			const { convId, cursor, limit } = req.body as {
				convId: string;
				cursor: string;
				limit: number;
			};

			const conv = await collection<Conversation>('conversations').findOne({
				_id: convId,
			});

			if (!conv.participants.find(name => name === req.user.name)) {
				// user is not part of conversation
				next(new Error('forbidden'));
			}

			const findCursor = collection<PrivateMessage>('privateMessages').find({
				convId,
			});

			if (cursor !== '') {
				findCursor.filter({ _id: { $lt: cursor } });
			}

			const privateMessages = await findCursor
				.sort({ _id: -1 })
				.limit(limit)
				.toArray();

			res.json(privateMessages);
		} catch (e) {
			next(new Error('unknown-error'));
		}
	}
);
