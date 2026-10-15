import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';

export class CustomerController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.createCustomer(req.body);
      return res.status(201).json({
        message: 'Cliente registrado exitosamente',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }
}