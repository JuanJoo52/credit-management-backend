import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extendemos el Request de Express para poder inyectarle el usuario
export interface AuthRequest extends Request {
  user?: any;
}


// 1. MIDDLEWARE PARA VERIFICAR EL TOKEN 

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Interceptar el Bearer Token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Acceso denegado. Token no proporcionado o malformado.' });
      return;
    }

    // Extraer solo el token (quitamos la palabra "Bearer ")
    const token = authHeader.split(' ')[1];

    if (!process.env.JWT_SECRET) {
      throw new Error('Error interno: JWT_SECRET no definido');
    }

    // 2 y 3. Verificar validez y expiración
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number, role: string };

    // 4. Buscar usuario en BD y verificar si está ACTIVO
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'El usuario asociado a este token no existe.' });
      return;
    }

    if (user.status !== 'ACTIVE') {
      res.status(401).json({ success: false, message: 'Usuario inactivo. Acceso revocado.' });
      return;
    }

    // Todo en orden: inyectamos el usuario a la petición y lo dejamos pasar
    req.user = user;
    next(); 

  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ success: false, message: 'El token ha expirado. Inicie sesión nuevamente.' });
      return;
    }
    res.status(401).json({ success: false, message: 'Token inválido.' });
  }
};


// 2. MIDDLEWARE PARA VERIFICAR ROLES

export const requireRoles = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, message: 'No autenticado.' });
      return;
    }

    // Verificamos si el rol del usuario está en la lista de permitidos
    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({ success: false, message: 'Acceso denegado. No tienes los permisos necesarios.' });
      return;
    }

    // Si tiene el rol, siga derecho
    next();
  };
};