import { Request, Response, NextFunction } from 'express';
import { createUserService } from '../services/user.service';


export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newUser = await createUserService(req.body);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });
  } catch (error: any) {
    next(error);
    
  }
};