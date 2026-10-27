import { Request, Response, NextFunction } from 'express';
import { CreditService } from '../services/credit.service';
import { AppError } from '../errors/app.error';

export class CreditController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const creditRequest = await CreditService.createCreditRequest(req.body);

      return res.status(201).json({
        message: 'Solicitud de crédito creada exitosamente en estado Pendiente',
        data: creditRequest,
      });
    } catch (error) {
      next(error);
    }
  }
  static async evaluate(req: Request, res: Response, next: NextFunction) {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        throw new AppError('El ID de la solicitud debe ser un número entero válido', 400);
      }

      const updatedCredit = await CreditService.evaluateCreditRequest(id, req.body);

      return res.status(200).json({
        message: `Solicitud de crédito evaluada exitosamente: ${updatedCredit.status}`,
        data: updatedCredit,
      });
    } catch (error) {
      next(error);
    }
  }
}