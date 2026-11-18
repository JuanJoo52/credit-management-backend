import { Router } from 'express';
import {
  searchPendingInstallments,
  createInstallmentPayment,
} from '../../controllers/collection.controller';
import { verifyToken, requireRoles } from '../../middlewares/auth.middleware';

const router = Router();

router.get(
  '/customers/:documentNumber/pending-installments',
  verifyToken,
  requireRoles(['ADMIN', 'ADVISOR','CASHIER']),
  searchPendingInstallments
);

router.post(
  '/payments',
  verifyToken,
  requireRoles(['CASHIER']),
  createInstallmentPayment
);

export default router;