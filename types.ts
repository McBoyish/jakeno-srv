/***************MONGODB INTERFACES***************/
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

/***************API INTERFACES***************/
export interface InputMessage {
	roomId: string;
	content: string;
	userId: string;
}

export interface RoomData extends Room {
	messages: Message[];
}

export enum ErrorType {
	UNKNOWN_ERROR = 'unknown-error',
	ERROR_404 = 'page-not-found',
}
