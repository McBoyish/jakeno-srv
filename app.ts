import { ORIGIN } from './utils/config';
import express from 'express';
import cors from 'cors';
import { roomRouter, userRouter } from './routers';
import { unknownEndpoint, errorHandler } from './utils/middleware';

const app = express();
app.use(cors({ origin: [ORIGIN, 'http://localhost:3000'] }));
app.use(express.json());
app.use('/api/rooms', roomRouter);
app.use('/api/users', userRouter);
app.use(unknownEndpoint);
app.use(errorHandler);

export { app };
