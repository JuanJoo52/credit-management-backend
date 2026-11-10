import { Router, Request, Response } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes'; 
import customerRoutes from './customer.routes';
import creditRoutes from './credit.routes';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'API v1 is running '});
});

router.use('/users', userRoutes);
router.use('/auth', authRoutes); 
router.use('/customers', customerRoutes);
router.use('/credits', creditRoutes);

export default router;