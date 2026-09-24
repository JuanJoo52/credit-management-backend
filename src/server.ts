import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

//version 1
const routerV1 = express.Router();

routerV1.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'API v1 is running smoothly' });
});

// Enganchamos las rutas de usuarios a la v1
routerV1.use('/users', userRoutes);
routerV1.use('/auth', authRoutes);

// Montamos TODA la v1 bajo el prefijo /api/v1
app.use('/api/v1', routerV1);
// ==========================================

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});