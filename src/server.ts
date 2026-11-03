import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import v1Routes from './routes/v1';
import { notFoundHandler, globalErrorHandler } from './middlewares/error.middleware';
import { jsonErrorHandler } from './middlewares/jsonErrorHandler.middleware';
import cors from 'cors'
const app = express();
const PORT = process.env.PORT || 3000;
const corsOrigins = process.env.CORS_ORIGINS;
if (!corsOrigins) {
  throw new Error('CORS_ORIGINS is not defined. Add it to your .env file');
}
const allowed = corsOrigins.split(',').map((o) => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    // allow requests without origin (Postman, curl) and the listed origins
    if (!origin || allowed.includes(origin)) return cb(null, true);
    cb(new Error('Origin not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json())

app.use(express.json());
app.use(jsonErrorHandler);

app.use('/api/v1',  v1Routes);
//Middlewares
app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});