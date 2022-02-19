import express from 'express';
import { ErrorType } from '../types';

const unknownEndpoint = (_: express.Request, res: express.Response) => {
	res.status(404).json({ error: ErrorType.ERROR_404 });
};

const errorHandler = (error: Error, _: any, res: express.Response, __: any) => {
	return res.status(400).json({ error: error.message });
};

export { unknownEndpoint, errorHandler };
