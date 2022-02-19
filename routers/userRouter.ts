import express from 'express';
import { Collection, ObjectId } from 'mongodb';
import { db } from '../database';
import { User, ErrorType } from '../types';

const userRouter = express.Router();

userRouter.get('/:name', async (req, res, next) => {
	try {
		const users: Collection<User> = db.collection('users');
		const user = await users.findOne({ name: req.params.name });
		if (user) {
			// if user exist, return data
			res.json(user);
			return;
		}
		// else create new user and return data
		const data: User = {
			_id: new ObjectId().toString(),
			name: req.params.name,
		};
		await users.insertOne(data);
		res.json(data);
		return;
	} catch (e) {
		next(new Error(ErrorType.UNKNOWN_ERROR));
		return;
	}
});

export { userRouter };
