import { PrismaClient, CreditStatus } from '@prisma/client';
import { AppError } from '../errors/app.error';
import { CreateCreditRequestDTO } from '../types/credit.types';

const prisma = new PrismaClient();

export class CreditService {
  // HU-08: Crear solicitud de crédito
  static async createCreditRequest(data: CreateCreditRequestDTO) {
    const { documentNumber, amount, termMonths, destination } = data;

    // Validacion de que hay datos
    if (!documentNumber || amount === undefined || termMonths === undefined || !destination) {
      throw new AppError('Todos los campos son obligatorios: documentNumber, amount, termMonths y destination', 400);
    }

    // Validar que el documento sea numérico
    if (!/^\d+$/.test(documentNumber)) {
      throw new AppError('El número de documento debe tener un formato numérico válido', 400);
    }

    // Validar valores numéricos positivos
    if (typeof amount !== 'number' || amount <= 0) {
      throw new AppError('El monto solicitado debe ser un valor numérico positivo mayor a cero', 400);
    }

    if (typeof termMonths !== 'number' || termMonths <= 0 || !Number.isInteger(termMonths)) {
      throw new AppError('El plazo debe ser un número entero positivo mayor a cero', 400);
    }

    // Límites de negocio (1 a 72 meses y máximo $100.000.000)
    if (termMonths < 1 || termMonths > 72) {
      throw new AppError('El plazo permitido debe estar entre 1 y 72 meses', 400);
    }

    if (amount > 100000000) {
      throw new AppError('El monto solicitado no puede superar los $100.000.000', 400);
    }

    //  Verificar que el cliente existe en la base de datos
    const customer = await prisma.customer.findUnique({
      where: { documentNumber },
    });

    if (!customer) {
      throw new AppError('No existe ningún cliente registrado con el número de documento proporcionado', 404);
    }

    // Registrar la solicitud en PostgreSQL con estado PENDING por defecto
    const creditRequest = await prisma.creditRequest.create({
      data: {
        amount,
        termMonths,
        destination: destination.trim(),
        status: CreditStatus.PENDING,
        customerId: customer.id,
      },
      include: {
        customer: {
          select: {
            documentNumber: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return creditRequest;
  }
}