import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app.error';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
};

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    console.error('[Error]:', err.message);
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
        return;
    }

    if (err.name === 'PrismaClientValidationError') {
        res.status(400).json({
            success: false,
            message: 'Datos inválidos. Verifique que los campos requeridos y valores sean correctos.'
        });
        return;
    }

    res.status(500).json({
        success: false,
        message: 'Error interno del servidor.'
    });
};