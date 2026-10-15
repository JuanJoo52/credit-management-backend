import { Router, Request, Response } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes'; 
import customerRoutes from './customer.routes';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'API v1 is running '});
});

router.use('/users', userRoutes);
router.use('/auth', authRoutes); 
router.use('/customers', customerRoutes);

export default router;