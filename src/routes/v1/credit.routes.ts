import { Router } from 'express';
import { CreditController } from '../../controllers/credit.controller';
import { verifyToken, requireRoles } from '../../middlewares/auth.middleware';

const router = Router();

// HU-11: Simulación de amortización (PÚBLICO)
router.post('/simulate', CreditController.simulate);
// HU-13: Formulario Público de Solicitud de Crédito
router.post('/public', CreditController.createPublic);
router.use(verifyToken);

// HU-08: Permitido exclusivamente para ADMIN y ADVISOR
router.post('/', requireRoles(['ADMIN', 'ADVISOR']), CreditController.create);
// HU-09: Reservado exclusivamente para ADMIN
router.patch('/:id/evaluate', requireRoles(['ADMIN']), CreditController.evaluate);
// HU-10: Listado y filtrado de solicitudes para ADMIN y ADVISOR
router.get('/', requireRoles(['ADMIN', 'ADVISOR']), CreditController.getCredits);
// HU-12: Liquidar/Desembolsar crédito (Exclusivo ADMIN)
router.post('/:id/disburse', requireRoles(['ADMIN']), CreditController.disburse);
// HU-14: Detalle de solicitud por ID (ADMIN, ADVISOR)
router.get('/:id', requireRoles(['ADMIN', 'ADVISOR']), CreditController.getById);

export default router;