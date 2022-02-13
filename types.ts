export interface Room {
	roomId: string;
	roomName: string;
}

export interface Message {
	user: string;
	content: string;
	roomId: string;
}
