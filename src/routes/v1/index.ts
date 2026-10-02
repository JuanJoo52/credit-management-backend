import { Router, Request, Response } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes'; 

const router = Router();

router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'API v1 is running '});
});

router.use('/users', userRoutes);
router.use('/auth', authRoutes); 

export default router;