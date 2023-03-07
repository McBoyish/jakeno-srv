import { ORIGIN } from './utils/config';
import express from 'express';
import cors from 'cors';
import { roomRouter, accountRouter, authRouter } from './controllers';
import { unknownEndpoint, errorHandler } from './utils/middlewares';
import { messageRouter } from './controllers/message';
import { convRouter } from './controllers/conversation';
import { privateMessageRouter } from './controllers/privateMessage';

export const app = express();
app.use(cors({ origin: [ORIGIN, 'http://localhost:3000'] }));
app.use(express.json());
app.use('/api/room', roomRouter);
app.use('/api/message', messageRouter);
app.use('/api/account', accountRouter);
app.use('/api/auth', authRouter);
app.use('/api/conv', convRouter);
app.use('/api/privateMessage', privateMessageRouter);
app.use(unknownEndpoint);
app.use(errorHandler);
