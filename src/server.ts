import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import v1Routes from './routes/v1';
import { notFoundHandler, globalErrorHandler } from './middlewares/error.middleware';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/v1',  v1Routes);
//Middlewares
app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});