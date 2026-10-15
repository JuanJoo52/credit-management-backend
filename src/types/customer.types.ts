import { DocumentType } from '@prisma/client';

export interface CreateCustomerDTO {
  documentType: DocumentType;
  documentNumber: string;
  firstName: string;
  lastName: string;
  monthlyIncome: number;
  address: string;
  phone: string;
}

export interface UpdateCustomerDTO {
  monthlyIncome?: number;
  address?: string;
  phone?: string;
}