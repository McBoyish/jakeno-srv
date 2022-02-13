export interface Room {
	_id: string;
	name: string;
}
export interface Message {
	_id: string;
	date: string;
	userId: string;
	roomId: string;
	content: string;
}
export interface User {
	_id: string;
	name: string;
}
// emit to client
export interface MessageField {
	date: string;
	content: string;
	userName: string;
}
// emit from client
export interface InputMessage {
	userId: string;
	roomId: string;
	content: string;
}
