import express from 'express';
import { Collection, ObjectId } from 'mongodb';
import { db } from '../utils/database';
import { User, InputUserAccount, UserAccount, UserData } from '../types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AUTH_KEY } from '../utils/config';

const authRouter = express.Router();

authRouter.post('/register', async (req, res, next) => {
	try {
		const { name, password } = req.body as InputUserAccount;
		const accountCollection: Collection<UserAccount> = db.collection('accounts');
		const userCollection: Collection<User> = db.collection('users');
		const user = await userCollection.findOne({ name });
		if (user) {
			res.json(null);
			return;
		}
		const encrypted = await bcrypt.hash(password, 10);
		const account: UserAccount = {
			_id: new ObjectId().toString(),
			user: { _id: new ObjectId().toString(), name },
			password: encrypted,
		};
		await accountCollection.insertOne(account);
		await userCollection.insertOne(account.user);
		const token = jwt.sign(account.user, AUTH_KEY, { expiresIn: '7d' });
		const userData: UserData = { ...account.user, token };
		res.json(userData);
	} catch (e) {
		next(new Error('unknown-error'));
	}
});

authRouter.post('/login', async (req, res, next) => {
	try {
		const { name, password } = req.body as InputUserAccount;
		const accountCollection: Collection<UserAccount> = db.collection('accounts');
		const account = await accountCollection.findOne({ 'user.name': name });
		if (account && (await bcrypt.compare(password, account.password))) {
			const token = jwt.sign(account.user, AUTH_KEY, {
				expiresIn: '7d',
			});
			const userData: UserData = { ...account.user, token };
			res.json(userData);
		}
		res.json(null);
	} catch (e) {
		next(new Error('unknown-error'));
	}
});

export { authRouter };
