import { Request, Response } from 'express';
import { AppError } from '../errors/app.error';
import { getPendingInstallmentsByDocument } from '../services/collection.service';

export const searchPendingInstallments = async (req: Request, res: Response): Promise<void> => {
  try {
    const documentNumber = String(req.params.documentNumber || '');
    const data = await getPendingInstallmentsByDocument(documentNumber);

    res.status(200).json({
      success: true,
      message: 'Cuotas pendientes consultadas exitosamente',
      data,
    });
  } catch (error: unknown) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Error al consultar cuotas pendientes';

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};