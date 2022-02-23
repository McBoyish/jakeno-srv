import express from 'express';
import { Collection } from 'mongodb';
import { db } from '../utils/database';
import { User, UserAuthInfoRequest } from '../types';
import { verifyToken } from '../utils/middlewares';

const userRouter = express.Router();

userRouter.get(
	'/:name',
	verifyToken,
	async (req: UserAuthInfoRequest, res, next) => {
		try {
			const userCollection: Collection<User> = db.collection('users');
			const user = await userCollection.findOne({ name: req.params.name });
			if (!user) {
				res.json(null);
				return;
			}
			res.json(user);
		} catch (e) {
			next(new Error('unknown-error'));
		}
	}
);

export { userRouter };
