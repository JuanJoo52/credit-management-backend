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

export interface CreditFilterDTO {
  status?: string;
  documentNumber?: string;
}

export interface SimulateCreditDTO {
  amount: number;
  termMonths: number;
}

export interface AmortizationScheduleItem {
  installmentNumber: number;
  payment: number;
  interest: number;
  principal: number;
  remainingBalance: number;
}

export interface AmortizationSimulationResponse {
  amount: number;
  termMonths: number;
  monthlyInterestRate: number;
  monthlyInstallment: number;
  totalInterest: number;
  totalPayment: number;
  schedule: AmortizationScheduleItem[];
}