import { Router } from 'express';
import { createUser, updateUserController } from '../../controllers/user.controller';
import { verifyToken, requireRoles } from '../../middlewares/auth.middleware';
const router = Router();

// Al enlazarse con la v1 en el server, esta ruta será: POST /api/v1/users
//se meten los 2 middlewares antes de llegar al controlador
router.post('/',
    verifyToken,
    requireRoles(['ADMIN']),
     createUser);

 //Endpoint actualizacion o desactivacion hu04
router.patch(
  '/:id',
  verifyToken,
  requireRoles(['ADMIN']),
  updateUserController
);
export default router;

