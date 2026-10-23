import { Request, Response, NextFunction } from 'express';
import { CreditService } from '../services/credit.service';

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
}