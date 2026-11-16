import { PrismaClient } from '@prisma/client';
import { AppError } from '../errors/app.error';

const prisma = new PrismaClient();

export const getPendingInstallmentsByDocument = async (documentNumber: string) => {
  if (!documentNumber || !documentNumber.trim()) {
    throw new AppError('El número de documento es obligatorio', 400);
  }
  const normalizedDocument = documentNumber.trim().toUpperCase();
  const customer = await prisma.customer.findUnique({
    where: { documentNumber: normalizedDocument },
    include: {
      creditRequests: {
        where: { status: 'DISBURSED' },
        include: {
          installments: {
            where: {
              status: 'PENDING',
            },
            orderBy: {
              dueDate: 'asc',
            },
          },
        },
      },
    },
  });

  if (!customer) {
    throw new AppError('No se encontró ningún cliente con ese número de documento', 404);
  }

  return {
    customer: {
      id: customer.id,
      fullName: `${customer.firstName} ${customer.lastName}`.trim(),
      documentNumber: customer.documentNumber,
    },
    activeCredits: customer.creditRequests.map((credit) => ({
      creditRequestId: credit.id,
      amount: credit.amount,
      pendingInstallments: credit.installments.map((inst) => ({
        installmentId: inst.id,
        installmentNumber: inst.installmentNumber,
        dueDate: inst.dueDate,
        totalAmount: inst.totalAmount,
        status: 'Pendiente',
      })),
    })),
  };
};