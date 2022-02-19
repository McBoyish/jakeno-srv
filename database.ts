import { MONGODB_URI } from './utils/config';
import { MongoClient, Db } from 'mongodb';

const client = new MongoClient(MONGODB_URI);
let db: Db | null = null;
client.connect().then(client => {
	db = client.db('randomstranger');
	console.log(`Successfully connected to database`);
});

export { db };
