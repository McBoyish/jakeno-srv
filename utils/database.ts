import { MONGODB_URI } from './config';
import { MongoClient, Db } from 'mongodb';

const client = new MongoClient(MONGODB_URI);
export let db: Db | null = null;

client.connect().then(client => {
	db = client.db('jakeno');
	console.log(`Successfully connected to database`);
});

type Collection =
	| 'users'
	| 'rooms'
	| 'accounts'
	| 'messages'
	| 'privateMessages'
	| 'conversations'
	| 'tasks';

export function collection<T>(name: Collection) {
	return db.collection<T>(name);
}
