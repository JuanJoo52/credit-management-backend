import dotenv from 'dotenv';
dotenv.config(); // Esto carga el .env antes de que Prisma despierte
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'API is running smoothly' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});