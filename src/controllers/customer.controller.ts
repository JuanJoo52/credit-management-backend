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
    static async getByDocument(req: Request, res: Response, next: NextFunction) {
        try {
            const documentNumber = req.params.documentNumber as string;
            const customer = await CustomerService.getCustomerByDocument(documentNumber);

            return res.status(200).json({
                data: customer,
            });
        } catch (error) {
            next(error);
        }
    }
}