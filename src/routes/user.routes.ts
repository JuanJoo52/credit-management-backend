import { Router } from 'express';
import { createUser } from '../controllers/user.controller';
import { verifyToken, requireRoles } from '../middlewares/auth.middleware';
const router = Router();

// Al enlazarse con la v1 en el server, esta ruta será: POST /api/v1/users
//se meten los 2 middlewares antes de llegar al controlador
router.post('/',
    verifyToken,
    requireRoles(['ADMIN']),
     createUser);

export default router;