import { Request } from 'express';

/***************MONGODB INTERFACES***************/
export interface Account {
	_id: string;
	user: User;
	password: string;
}

export interface Room {
	_id: string;
	name: string;
}

export interface User {
	_id: string;
	name: string;
}

export interface Message {
	_id: string;
	roomId: string;
	content: string;
	user: User;
	date: string;
}

/***************REQUEST INTERFACES***************/
export interface UserAuthInfoRequest extends Request {
	user: User;
}

/***************API INTERFACES***************/
export interface InputMessage {
	roomId: string;
	content: string;
	userId: string;
}

export interface InputRoom {
	name: string;
}

export interface InputAccount {
	name: string;
	password: string;
}

export interface RoomData extends Room {
	messages: Message[];
}

export interface UserData extends User {
	token: string;
}
