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
  static async getCredits(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, documentNumber } = req.query;

      const filters = {
        status: status ? String(status) : undefined,
        documentNumber: documentNumber ? String(documentNumber) : undefined,
      };

      const credits = await CreditService.getCredits(filters);

      return res.status(200).json({
        message: 'Listado de solicitudes de crédito obtenido exitosamente',
        count: credits.length,
        data: credits,
      });
    } catch (error) {
      next(error);
    }
  }
  static simulate(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Validar que req.body sea un objeto no nulo
      if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        throw new AppError('El cuerpo de la petición debe ser un objeto JSON válido con los campos amount y termMonths', 400);
      }

      const { amount, termMonths } = req.body;

      // 2. Validar presencia de parámetros obligatorios
      if (amount === undefined || termMonths === undefined) {
        throw new AppError('Los campos amount y termMonths son obligatorios', 400);
      }

      const parsedAmount = Number(amount);
      const parsedTermMonths = Number(termMonths);

      // 3. Delegar al servicio
      const simulation = CreditService.simulateAmortization({
        amount: parsedAmount,
        termMonths: parsedTermMonths,
      });

      return res.status(200).json({
        message: 'Simulación del plan de amortización realizada exitosamente',
        data: simulation,
      });
    } catch (error) {
      next(error);
    }
  }
  // HU-12: Liquidación / Desembolso
  static async disburse(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);

      const disbursedCredit = await CreditService.disburseCredit(id);

      return res.status(200).json({
        message: 'Crédito liquidado y desembolsado exitosamente. Se ha generado el cronograma oficial de pagos.',
        data: disbursedCredit,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);

      const creditRequest = await CreditService.getCreditById(id);

      return res.status(200).json({
        message: 'Detalle de la solicitud de crédito obtenido exitosamente',
        data: creditRequest,
      });
    } catch (error) {
      next(error);
    }
  }

}