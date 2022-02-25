import express from 'express';
import { verifyToken } from '../utils/middlewares';
import { UserAuthInfoRequest } from '../types';

const authRouter = express.Router();

authRouter.post(
	'/verify',
	verifyToken,
	async (req: UserAuthInfoRequest, res, next) => {
		try {
			res.json(req.user);
		} catch (e) {
			next(new Error('unknown-error'));
		}
	}
);

export { authRouter };
