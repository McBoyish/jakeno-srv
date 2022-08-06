import { Mutex } from 'async-mutex';

export const messageMutex = new Mutex();
