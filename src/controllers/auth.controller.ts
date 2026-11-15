import { Request, Response } from 'express';
import { loginService } from '../services/auth.service';
import {
  forgotPasswordService,
  resetPasswordService,
} from '../services/auth.service';
import { AppError } from '../errors/app.error';

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
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await forgotPasswordService(req.body.email);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: unknown) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Error al procesar la solicitud';

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    const result = await resetPasswordService(token, newPassword);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: unknown) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Error al restablecer la contraseña';

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};