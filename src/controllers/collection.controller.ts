import { Request, Response } from 'express';
import {
  getPendingInstallmentsByDocument,
  registerInstallmentPayment,
} from '../services/collection.service';
import { AppError } from '../errors/app.error';

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

export const createInstallmentPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const installmentId = Number(req.body.installmentId);
    const amount = Number(req.body.amount);

    const authUser = (req as Request & { user?: { userId?: number; id?: number } }).user;
    const cashierId = Number(authUser?.userId ?? authUser?.id);

    if (!cashierId || Number.isNaN(cashierId)) {
      throw new AppError('No se pudo identificar al cajero autenticado', 401);
    }

    const data = await registerInstallmentPayment(installmentId, amount, cashierId);

    res.status(201).json({
      success: true,
      message: 'Pago registrado exitosamente',
      data,
    });
  } catch (error: unknown) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Error al registrar el pago';

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};