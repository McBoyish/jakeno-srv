import express from 'express';
import { ObjectId } from 'mongodb';
import { collection } from '../utils/database';
import { User, InputAccount, Account, UserData } from '../types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AUTH_KEY } from '../utils/config';

export const accountRouter = express.Router();

accountRouter.post('/register', async (req, res, next) => {
	try {
		const { name, password } = req.body as InputAccount;
		const user = await collection<User>('users').findOne({ name });
		if (user) {
			res.json(null);
			return;
		}
		const account: Account = {
			_id: new ObjectId().toString(),
			user: { _id: new ObjectId().toString(), name },
			password: await bcrypt.hash(password, 10),
			createdAt: new Date().toISOString(),
		};
		await collection<Account>('accounts').insertOne(account);
		await collection<User>('users').insertOne(account.user);
		const token = jwt.sign(account.user, AUTH_KEY, { expiresIn: '28d' });
		const userData: UserData = { ...account.user, token };
		res.json(userData);
	} catch (e) {
		next(new Error('unknown-error'));
	}
});

accountRouter.post('/login', async (req, res, next) => {
	try {
		const { name, password } = req.body as InputAccount;
		const account = await collection<Account>('accounts').findOne({
			'user.name': name,
		});
		if (account && (await bcrypt.compare(password, account.password))) {
			const token = jwt.sign(account.user, AUTH_KEY, {
				expiresIn: '28d',
			});
			const userData: UserData = { ...account.user, token };
			res.json(userData);
			return;
		}
		res.json(null);
	} catch (e) {
		next(new Error('unknown-error'));
	}
});
