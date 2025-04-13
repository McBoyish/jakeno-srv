import express from 'express';
import { ObjectId } from 'mongodb';
import { collection } from '../utils/database';
import { Task } from '../types';
import { Request } from 'express';

export const taskRouter = express.Router();

taskRouter.get('/', async (_, res, next) => {
	try {
		const rooms = (await collection<Task>('tasks')
			.find()
			.toArray()) as Task[];
		res.json(rooms);
	} catch (e) {
		next(new Error('unknown-error'));
	}
});

taskRouter.post('/', async (req: Request, res, next) => {
	try {
		const { date, timeEntries, title, description, project } = req.body as Task;
		const data: Task = {
			date,
			timeEntries,
			title,
			description,
            project,
		};
        if (req.body.update) {
            await collection<Task>('tasks').updateOne({ _id: req.body._id }, data);
        } else if (req.body.delete) {
            await collection<Task>('tasks').deleteOne({ _id: req.body.id });
        } else {
            data._id = new ObjectId().toString();
            await collection<Task>('tasks').insertOne(data);
        }
		res.json(data);
	} catch (e) {
		next(new Error('unknown-error'));
	}
});
