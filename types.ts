import { WithoutId } from 'mongodb';

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

export interface OutputMessage {
	content: string;
	user: WithoutId<User>;
	date: string;
}

export interface InputMessage {
	roomId: string;
	content: string;
	userId: string;
}
