import { PrismaClient } from '@prisma/client';
import { AppError } from '../errors/app.error';
import { CreateCustomerDTO } from '../types/customer.types';

const prisma = new PrismaClient();

export class CustomerService {
    static async createCustomer(data: CreateCustomerDTO) {
        const { documentType, documentNumber, firstName, lastName, monthlyIncome, address, phone } = data;

        // Validación de campos obligatorios
        if (!documentType || !documentNumber || !firstName || !lastName || monthlyIncome === undefined || !address || !phone) {
            throw new AppError('Todos los campos son obligatorios', 400);
        }

        // Validar que los ingresos declarados sean un valor numérico positivo mayor a cero
        if (typeof monthlyIncome !== 'number' || monthlyIncome <= 0) {
            throw new AppError('Los ingresos mensuales declarados deben ser un valor positivo mayor a cero', 400);
        }

        // Validaciones de formato numérico
        if (!/^\d+$/.test(documentNumber)) {
            throw new AppError('El número de documento debe contener solo dígitos numéricos', 400);
        }

        if (!/^\d+$/.test(phone)) {
            throw new AppError('El número de teléfono debe contener solo dígitos numéricos', 400);
        }

        // Unicidad del documento -> 409 Conflict
        const existingCustomer = await prisma.customer.findUnique({
            where: { documentNumber },
        });

        if (existingCustomer) {
            throw new AppError('El número de documento ya se encuentra registrado en la base de datos', 409);
        }

        return await prisma.customer.create({
            data: {
                documentType,
                documentNumber,
                firstName,
                lastName,
                monthlyIncome,
                address,
                phone,
            },
        });
    }

    // HU-06: Buscar Cliente por Número de Documento
    static async getCustomerByDocument(documentNumber: string) {
        // Validación de formato numérico previo a la consulta en BD
        if (!documentNumber || !/^\d+$/.test(documentNumber)) {
            throw new AppError('El número de documento ingresado debe tener un formato numérico válido', 400);
        }

        const customer = await prisma.customer.findUnique({
            where: { documentNumber },
        });

        if (!customer) {
            throw new AppError('Cliente no encontrado con el número de documento proporcionado', 404);
        }

        return customer;
    }

}