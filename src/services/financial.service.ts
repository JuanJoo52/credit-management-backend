export class FinancialService {
  // Tasa Interes
  private static readonly MONTHLY_INTEREST_RATE: number = 0.015;

  // Cuota con Sistema de Amortización Francés:
  static calculateFrenchAmortizationInstallment(amount: number, termMonths: number): number {
    const i = this.MONTHLY_INTEREST_RATE;
    const n = termMonths;

    if (i === 0) return Number((amount / n).toFixed(2));

    const numerator = i * Math.pow(1 + i, n);
    const denominator = Math.pow(1 + i, n) - 1;
    const monthlyInstallment = amount * (numerator / denominator);

    return Number(monthlyInstallment.toFixed(2));
  }

  //Valida si la cuota estimada cumple la regla de capacidad de pago (<= 40% de ingresos)
  static isPaymentCapacityValid(monthlyInstallment: number, monthlyIncome: number): boolean {
    const maxAllowedInstallment = monthlyIncome * 0.40;
    return monthlyInstallment <= maxAllowedInstallment;
  }
}