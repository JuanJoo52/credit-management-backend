import { InstallmentStatus, PrismaClient } from '@prisma/client';
import { AppError } from '../errors/app.error';

const prisma = new PrismaClient();

const STATUS_LABELS: Record<InstallmentStatus, string> = {
  PENDING: 'Pendiente',
  PARTIAL: 'Con abono',
  OVERDUE: 'Vencida',
  PAID: 'Pagada',
};

export const getPendingInstallmentsByDocument = async (documentNumber: string) => {
  if (!documentNumber || !documentNumber.trim()) {
    throw new AppError('El número de documento es obligatorio', 400);
  }

  const normalizedDocument = documentNumber.trim().toUpperCase();

  const customer = await prisma.customer.findUnique({
    where: {
      documentNumber: normalizedDocument,
    },
    include: {
      creditRequests: {
        where: {
          status: 'DISBURSED',
        },
        include: {
          installments: {
            where: {
              status: {
                in: ['PENDING', 'PARTIAL', 'OVERDUE'],
              },
            },
            orderBy: {
              dueDate: 'asc', // Primero la cuota más antigua sin pagar
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
      pendingInstallments: credit.installments.map((inst) => {
        const pendingBalance = Number((inst.totalAmount - inst.paidAmount).toFixed(2));
        return {
          installmentId: inst.id,
          installmentNumber: inst.installmentNumber,
          dueDate: inst.dueDate,
          totalAmount: inst.totalAmount,
          paidAmount: inst.paidAmount,
          pendingBalance,
          status: STATUS_LABELS[inst.status],
        };
      }),
    })),
  };
};

export const registerInstallmentPayment = async (
  installmentId: number,
  amount: number,
  cashierId: number
) => {
  if (!Number.isInteger(installmentId) || installmentId <= 0) {
    throw new AppError('El ID de la cuota es inválido', 400);
  }

  if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
    throw new AppError('El monto del pago debe ser un valor numérico positivo mayor a cero', 400);
  }

  return prisma.$transaction(async (tx) => {
    const installment = await tx.installment.findUnique({
      where: { id: installmentId },
    });

    if (!installment) {
      throw new AppError('La cuota especificada no existe', 404);
    }

    const currentPending = Number((installment.totalAmount - installment.paidAmount).toFixed(2));

    if (installment.status === 'PAID' || currentPending <= 0) {
      throw new AppError('Esta cuota ya se encuentra pagada en su totalidad', 400);
    }

    if (amount > currentPending) {
      throw new AppError(
        `El monto ingresado ($${amount}) supera el saldo pendiente actual de la cuota ($${currentPending})`,
        400
      );
    }

    const updatedPaidAmount = Number((installment.paidAmount + amount).toFixed(2));
    const remainingBalance = Number((installment.totalAmount - updatedPaidAmount).toFixed(2));
    const newStatus: InstallmentStatus = remainingBalance === 0 ? 'PAID' : 'PARTIAL';

    const updatedInstallment = await tx.installment.update({
      where: { id: installment.id },
      data: {
        paidAmount: updatedPaidAmount,
        status: newStatus,
      },
    });

    const payment = await tx.payment.create({
      data: {
        installmentId: installment.id,
        amount,
        cashierId,
      },
    });

    return {
      receipt: {
        paymentId: payment.id,
        paidAt: payment.paidAt,
        amountPaid: payment.amount,
        installmentId: updatedInstallment.id,
        installmentNumber: updatedInstallment.installmentNumber,
        totalInstallmentAmount: updatedInstallment.totalAmount,
        paidAmount: updatedInstallment.paidAmount,
        remainingBalance,
        status: STATUS_LABELS[newStatus],
      },
    };
  });
};