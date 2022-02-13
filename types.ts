export interface Room {
	roomId: string;
	roomName: string;
}

export interface Message {
	username: string;
	content: string;
	roomId: string;
}
