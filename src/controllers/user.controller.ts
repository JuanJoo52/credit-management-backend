import { Request, Response } from 'express';
import { createUserService } from '../services/user.service';

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const newUser = await createUserService(req.body);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};