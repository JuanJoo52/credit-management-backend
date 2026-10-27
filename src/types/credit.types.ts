export interface CreateCreditRequestDTO {
  documentNumber: string;
  amount: number;
  termMonths: number;
  destination: string;
}

export interface EvaluateCreditRequestDTO {
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}