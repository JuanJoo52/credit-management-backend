import { PrismaClient, CreditStatus } from '@prisma/client';
import { AppError } from '../errors/app.error';
import { CreateCreditRequestDTO, EvaluateCreditRequestDTO, CreditFilterDTO, SimulateCreditDTO, AmortizationSimulationResponse } from '../types/credit.types';
import { FinancialService } from './financial.service';


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
  static async evaluateCreditRequest(id: number, data: EvaluateCreditRequestDTO) {
    const { status, rejectionReason } = data;

    // Validar que el estado enviado sea estrictamente APPROVED o REJECTED
    if (!status || (status !== 'APPROVED' && status !== 'REJECTED')) {
      throw new AppError('El estado enviado es inválido. Debe ser APPROVED o REJECTED', 400);
    }
    //
    if (status === 'REJECTED' && (!rejectionReason || !rejectionReason.trim())) {
      throw new AppError('Es obligatorio proporcionar la razón del rechazo (rejectionReason) al rechazar una solicitud', 400);
    }

    //  Buscar la solicitud de crédito con el cliente asociado
    const creditRequest = await prisma.creditRequest.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!creditRequest) {
      throw new AppError('Solicitud de crédito no encontrada', 404);
    }

    // Inmutabilidad: Verificar que se encuentre en estado PENDING
    if (creditRequest.status !== CreditStatus.PENDING) {
      throw new AppError('La solicitud ya fue evaluada previamente y no puede modificarse', 400);
    }

    //  Evaluar Capacidad de Pago al 40% si la decisión del ADMIN es APROBAR
    if (status === 'APPROVED') {
      const estimatedInstallment = FinancialService.calculateFrenchAmortizationInstallment(
        creditRequest.amount,
        creditRequest.termMonths
      );

      const hasCapacity = FinancialService.isPaymentCapacityValid(
        estimatedInstallment,
        creditRequest.customer.monthlyIncome
      );

      if (!hasCapacity) {
        const maxCapacity = creditRequest.customer.monthlyIncome * 0.40;
        throw new AppError(
          `La cuota mensual estimada ($${estimatedInstallment.toLocaleString()}) excede el 40% de la capacidad de pago del cliente ($${maxCapacity.toLocaleString()})`,
          400
        );
      }
    }

    // Determinar el enum exacto de Prisma
    const targetStatus: CreditStatus = status === 'APPROVED' ? CreditStatus.APPROVED : CreditStatus.REJECTED;

    // Actualizar en la base de datos PostgreSQL y retornar el resultado
    const updatedCreditRequest = await prisma.creditRequest.update({
      where: { id },
      data: {
        status: targetStatus,
        rejectionReason: targetStatus === CreditStatus.REJECTED
          ? rejectionReason!.trim() : null,
      },
      include: {
        customer: {
          select: {
            documentNumber: true,
            firstName: true,
            lastName: true,
            monthlyIncome: true,
          },
        },
      },
    });

    return updatedCreditRequest;
  }


  //HU-10
  static async getCredits(filters: CreditFilterDTO) {
    const { status, documentNumber } = filters;

    const whereClause: any = {};

    if (status) {
      const uppercaseStatus = status.toUpperCase();
      if (!Object.values(CreditStatus).includes(uppercaseStatus as CreditStatus)) {
        throw new AppError(`El estado '${status}' no es un filtro válido`, 400);
      }
      whereClause.status = uppercaseStatus as CreditStatus;
    }

    if (documentNumber) {
      whereClause.customer = {
        documentNumber: documentNumber.trim(),
      };
    }

    const credits = await prisma.creditRequest.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            documentNumber: true,
            firstName: true,
            lastName: true,
            monthlyIncome: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return credits;
  }
  //HU-11
  static simulateAmortization(data: SimulateCreditDTO): AmortizationSimulationResponse {
    const { amount, termMonths } = data;

    if (amount === undefined || isNaN(amount) || amount <= 0) {
      throw new AppError('El monto del crédito (amount) debe ser un número válido mayor a 0', 400);
    }

    if (termMonths === undefined || isNaN(termMonths) || !Number.isInteger(termMonths) || termMonths < 1 || termMonths > 72) {
      throw new AppError('El plazo en meses (termMonths) debe ser un número entero entre 1 y 72', 400);
    }

    return FinancialService.generateAmortizationSchedule(amount, termMonths);
  }
  // HU-12
  static async getCreditById(id: number) {
    if (isNaN(id) || id <= 0) {
      throw new AppError('El ID de la solicitud debe ser un número entero válido mayor a 0', 400);
    }

    const creditRequest = await prisma.creditRequest.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            documentNumber: true,
            firstName: true,
            lastName: true,
            phone: true,
            monthlyIncome: true,
          },
        },
        installments: {
          orderBy: {
            installmentNumber: 'asc',
          },
        },
      },
    });

    if (!creditRequest) {
      throw new AppError(`No se encontró ninguna solicitud de crédito con el ID ${id}`, 404);
    }

    return creditRequest;
  }
}
