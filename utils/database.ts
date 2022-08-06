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

export function findOne<T>(name: Collection, filter: Filter<T>) {
	return collection<T>(name).findOne(filter);
}

export function find<T>(
	name: Collection,
	filter: Filter<T>,
	options?: FindOptions
) {
	return collection<T>(name).find(filter, options).toArray();
}

export function insertOne<T>(
	name: Collection,
	data: OptionalUnlessRequiredId<T>
) {
	return collection<T>(name).insertOne(data);
}
