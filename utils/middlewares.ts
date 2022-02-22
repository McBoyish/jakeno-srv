import express from 'express';
import jwt from 'jsonwebtoken';
import { UserAuthInfoRequest, User } from '../types';
import { AUTH_KEY } from './config';

type Req = express.Request;
type Res = express.Response;
type Next = express.NextFunction;

const unknownEndpoint = (_: Req, res: Res) => {
	res.status(404).json({ message: 'page-not-found' });
};

const errorHandler = (error: Error, _: Req, res: Res, next: Next) => {
	if (error.message === 'unknown-error') {
		res.status(500).json({ message: 'An unknown error has occurred' });
		return;
	}
	next(error);
};

const verifyToken = (req: UserAuthInfoRequest, res: Res, next: Next) => {
	const token = req.headers['x-access-token'] as string;
	if (!token) {
		res.status(403).json({ message: 'A token is required for authentication' });
		return;
	}
	try {
		const decoded = jwt.verify(token, AUTH_KEY) as User;
		req.user = decoded;
	} catch (e) {
		res.status(401).json({ message: 'Invalid token' });
		return;
	}
	next();
};

export { unknownEndpoint, errorHandler, verifyToken };
