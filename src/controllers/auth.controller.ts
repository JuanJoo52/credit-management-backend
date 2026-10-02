import { Request, Response } from 'express';
import { loginService } from '../services/auth.service';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await loginService(req.body);
    
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: result
    });
  } catch (error: any) {
    // 401 significa que no tiene permisos / credenciales malas
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};