import express from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, User } from '../types';
import { AUTH_KEY } from './config';

type Req = express.Request;
type Res = express.Response;
type Next = express.NextFunction;

const unknownEndpoint = (_: Req, res: Res) => {
	res.status(404).json({ message: 'page-not-found' });
};

const errorHandler = (error: Error, _: Req, res: Res, next: Next) => {
	if (error.message === 'unknown-error') {
		res.status(500).json({ message: error.message });
		return;
	}
	if (error.message === 'invalid-room-code') {
		res.status(403).json({ message: error.message });
		return;
	}
	next(error);
};

const verifyToken = (req: AuthRequest, res: Res, next: Next) => {
	try {
		const token = req.headers['x-access-token'] as string;
		if (!token) {
			res.status(403).json(null);
			return;
		}
		const decoded = jwt.verify(token, AUTH_KEY) as User;
		req.user = { name: decoded.name, _id: decoded._id };
	} catch (e) {
		res.status(401).json(null);
		return;
	}
	next();
};

export { unknownEndpoint, errorHandler, verifyToken };
