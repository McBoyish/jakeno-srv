import { Request } from 'express';

type DateTime = string;

export interface Task {
	_id?: string;
	date: string;
	timeEntries: string;
	title: string;
	description: string;
	project: string;
}

/***************MONGODB INTERFACES***************/
export interface Account {
	_id: string;
	password: string;
	user: User;
	createdAt: DateTime;
}

export interface Room {
	_id: string;
	name: string;
	description: string;
	code: string;
	isPrivate: boolean;
	user: User;
	createdAt: DateTime;
}

export interface User {
	_id: string;
	name: string;
	// TODO: add profile info here
}

export interface Message {
	_id: string;
	roomId: string;
	content: string;
	user: User;
	createdAt: DateTime;
}

export interface Conversation {
	_id: string;
	participants: string[]; // array of names (size 2 for now)
	createdAt: DateTime;
}

export interface PrivateMessage {
	_id: string;
	convId: string;
	content: string;
	user: User;
	createdAt: DateTime;
}

/***************REQUEST INTERFACES***************/
export interface AuthRequest extends Request {
	user: User;
}

/***************API INTERFACES***************/
export interface InputMessage {
	roomId: string;
	roomName: string;
	user: User;
	content: string;
}

export interface InputRoom {
	name: string;
	description: string;
	code: string;
}

export interface InputAccount {
	name: string;
	password: string;
}

export type RoomNoCode = Omit<Room, 'code'>; // named Room on client side

export interface LiveRoom extends RoomNoCode {
	activeUsers: number;
}

export interface UserData extends User {
	token: string;
}

export interface InputPrivateMessage {
	convId: string;
	content: string;
	user: User;
	createdAt: DateTime;
}

export interface InputConv {
	participants: string[]; // array of names (size 2 for now)
}
