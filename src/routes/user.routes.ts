import { Router } from 'express';
import { createUser } from '../controllers/user.controller';

const router = Router();

// Al enlazarse con la v1 en el server, esta ruta será: POST /api/v1/users
router.post('/', createUser);

export default router;