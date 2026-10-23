export interface CreateCreditRequestDTO {
  documentNumber: string;
  amount: number;
  termMonths: number;
  destination: string;
}