import express from 'express';
import { verifyToken } from '../utils/middlewares';
import { AuthRequest } from '../types';

export const authRouter = express.Router();

authRouter.post('/verify', verifyToken, async (req: AuthRequest, res, next) => {
	try {
		res.json(req.user);
	} catch (e) {
		next(new Error('unknown-error'));
	}
});
