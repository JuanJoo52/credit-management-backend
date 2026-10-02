import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createUserService, updateUserService } from '../services/user.service';


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

export const updateUserController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, role, status } = req.body;
    const currentAdminId = req.user?.id;

    if (!currentAdminId) {
      res.status(401).json({
        success: false,
        message: 'Sesión no autorizada o token inválido'
      });
      return;
    }

    if (name === undefined && role === undefined && status === undefined) {
      res.status(400).json({
        success: false,
        message: 'Debe enviar al menos un campo a modificar (name, role o status)'
      });
      return;
    }

    const updatedUser = await updateUserService(id, currentAdminId, { name, role, status });

    res.status(200).json({
      success: true,
      message: 'Empleado actualizado exitosamente',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};
  