import { Request } from 'express';

type DateTime = string;

/***************MONGODB INTERFACES***************/
export interface Account {
	_id: string;
	user: User;
	password: string;
	createdAt: DateTime;
}

export interface Room {
	_id: string;
	userId: string;
	name: string;
	description: string;
	code: string;
	createdAt: DateTime;
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
	createdAt: DateTime;
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
	userId: string;
	name: string;
	description: string;
	code: string;
}

export interface InputAccount {
	name: string;
	password: string;
}

export interface RoomData extends Omit<Room, 'code'> {
	messages: Message[];
}

export interface UserData extends User {
	token: string;
}
