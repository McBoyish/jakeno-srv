import { ORIGIN } from './utils/config';
import express from 'express';
import cors from 'cors';
import { roomRouter, accountRouter, authRouter } from './controllers';
import { unknownEndpoint, errorHandler } from './utils/middlewares';

const app = express();
app.use(cors({ origin: [ORIGIN, 'http://localhost:3000'] }));
app.use(express.json());
app.use('/api/rooms', roomRouter);
app.use('/api/account', accountRouter);
app.use('/api/auth', authRouter);
app.use(unknownEndpoint);
app.use(errorHandler);

export { app };
