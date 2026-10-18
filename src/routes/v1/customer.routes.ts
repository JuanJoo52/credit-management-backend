import { Router } from 'express';
import { CustomerController } from '../../controllers/customer.controller';
import { verifyToken, requireRoles } from '../../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);
router.use(requireRoles(['ADMIN', 'ADVISOR']));

router.post('/', CustomerController.create);
router.get('/by-document/:documentNumber', CustomerController.getByDocument);
router.patch('/by-document/:documentNumber', CustomerController.updateByDocument);

export default router;