import { Router } from 'express';
import { searchPendingInstallments } from '../../controllers/collection.controller';
import { verifyToken, requireRoles } from '../../middlewares/auth.middleware';

const router = Router();

router.get(
  '/customers/:documentNumber/pending-installments',
  verifyToken,
  requireRoles(['CASHIER', 'ADVISOR', 'ADMIN']),
  searchPendingInstallments
);

export default router;