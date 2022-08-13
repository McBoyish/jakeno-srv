import { MONGODB_URI } from './config';
import {
	MongoClient,
	Db,
	Filter,
	OptionalUnlessRequiredId,
	FindOptions,
} from 'mongodb';

const client = new MongoClient(MONGODB_URI);
export let db: Db | null = null;

client.connect().then(client => {
	db = client.db('jakeno');
	console.log(`Successfully connected to database`);
});

type Collection = 'users' | 'rooms' | 'accounts' | 'messages';

export function collection<T>(name: Collection) {
	return db.collection<T>(name);
}

export async function findOne<T>(name: Collection, filter: Filter<T>) {
	return await collection<T>(name).findOne(filter);
}

export async function find<T>(
	name: Collection,
	filter: Filter<T>,
	options?: FindOptions
) {
	return await collection<T>(name).find(filter, options).toArray();
}

export async function insertOne<T>(
	name: Collection,
	data: OptionalUnlessRequiredId<T>
) {
	return await collection<T>(name).insertOne(data);
}
