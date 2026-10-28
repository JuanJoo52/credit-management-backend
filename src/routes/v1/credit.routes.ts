import { Router } from 'express';
import { CreditController } from '../../controllers/credit.controller';
import { verifyToken, requireRoles } from '../../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

// HU-08: Permitido exclusivamente para ADMIN y ADVISOR
router.post('/', requireRoles(['ADMIN', 'ADVISOR']), CreditController.create);
// HU-09: Reservado exclusivamente para ADMIN
router.patch('/:id/evaluate', requireRoles(['ADMIN']), CreditController.evaluate);
// HU-10: Listado y filtrado de solicitudes para ADMIN y ADVISOR
router.get('/', requireRoles(['ADMIN', 'ADVISOR']), CreditController.getCredits);

export default router;