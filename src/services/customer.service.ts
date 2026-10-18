import { PrismaClient } from '@prisma/client';
import { AppError } from '../errors/app.error';
import { CreateCustomerDTO, UpdateCustomerDTO } from '../types/customer.types';

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
    // HU-07: Actualizar datos de contacto e ingresos del cliente
    static async updateCustomer(documentNumber: string, data: UpdateCustomerDTO, bodyPayload: any) {
        // 1. Validar formato numérico del parámetro de ruta
        if (!documentNumber || !/^\d+$/.test(documentNumber)) {
            throw new AppError('El número de documento ingresado debe tener un formato numérico válido', 400);
        }

        // 2. Regla defensiva: Inmutabilidad del número y tipo de documento
        if (bodyPayload.documentNumber !== undefined || bodyPayload.documentType !== undefined) {
            throw new AppError('El número y tipo de documento son inmutables y no se pueden modificar', 400);
        }

        // 3. Validar que se envíe al menos un campo permitido para actualizar
        if (data.monthlyIncome === undefined && data.address === undefined && data.phone === undefined) {
            throw new AppError('Debe proporcionar al menos un campo válido para actualizar (monthlyIncome, address o phone)', 400);
        }

        // 4. Verificar existencia previa en base de datos
        const existingCustomer = await prisma.customer.findUnique({
            where: { documentNumber },
        });

        if (!existingCustomer) {
            throw new AppError('Cliente no encontrado con el número de documento proporcionado', 404);
        }

        // 5. Validar que los ingresos declarados sean estrictamente positivos si se incluyen en el body
        if (data.monthlyIncome !== undefined) {
            if (typeof data.monthlyIncome !== 'number' || data.monthlyIncome <= 0) {
                throw new AppError('Los ingresos mensuales declarados deben ser un valor positivo mayor a cero', 400);
            }
        }

        // 6. Validar formato del teléfono si se incluye en el body
        if (data.phone !== undefined && !/^\d+$/.test(data.phone)) {
            throw new AppError('El número de teléfono debe contener solo dígitos numéricos', 400);
        }

        // 7. Actualización parcial en PostgreSQL vía Prisma
        return await prisma.customer.update({
            where: { documentNumber },
            data: {
                ...(data.monthlyIncome !== undefined && { monthlyIncome: data.monthlyIncome }),
                ...(data.address !== undefined && { address: data.address }),
                ...(data.phone !== undefined && { phone: data.phone }),
            },
        });
    }

}