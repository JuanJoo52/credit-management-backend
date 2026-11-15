import { Router } from 'express';
import { CustomerController } from '../../controllers/customer.controller';
import { verifyToken, requireRoles } from '../../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

router.post('/', CustomerController.create);
router.get('/by-document/:documentNumber',requireRoles(['ADMIN', 'ADVISOR']), CustomerController.getByDocument);
router.patch('/by-document/:documentNumber',requireRoles(['ADMIN', 'ADVISOR']), CustomerController.updateByDocument);
router.get('/',requireRoles(['ADMIN', 'ADVISOR','CASHIER']),CustomerController.getAll);

export default router;