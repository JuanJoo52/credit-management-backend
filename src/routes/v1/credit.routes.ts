import { Router } from 'express';
import { CreditController } from '../../controllers/credit.controller';
import { verifyToken, requireRoles } from '../../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

// HU-08: Permitido exclusivamente para ADMIN y ADVISOR
router.post('/', requireRoles(['ADMIN', 'ADVISOR']), CreditController.create);

export default router;