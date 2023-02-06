import { ObjectId } from 'mongodb';
import { Socket } from 'socket.io';
import { collection } from '../utils/database';
import { InputMessage, Message } from '../types';

export const registerPrivateMessageHandlers = (socket: Socket) => {
  const message = async (
    input: any,
    callback: (res: any) => void
  ) => {

  };
}

// private msg
// participant: [A, B]
