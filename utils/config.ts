import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT;
const ORIGIN = process.env.ORIGIN;
const MONGODB_URI = process.env.MONGODB_URI;
const AUTH_KEY = process.env.AUTH_KEY;

export { PORT, ORIGIN, MONGODB_URI, AUTH_KEY };
