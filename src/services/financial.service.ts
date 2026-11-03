import { AmortizationScheduleItem, AmortizationSimulationResponse } from '../types/credit.types';
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
  static generateAmortizationSchedule(amount: number, termMonths: number): AmortizationSimulationResponse {
    const monthlyInstallment = this.calculateFrenchAmortizationInstallment(amount, termMonths);
    const schedule: AmortizationScheduleItem[] = [];
    
    let remainingBalance = amount;
    let totalInterest = 0;

    for (let period = 1; period <= termMonths; period++) {
      const interest = Math.round(remainingBalance * this.MONTHLY_INTEREST_RATE * 100) / 100;
      let principal = Math.round((monthlyInstallment - interest) * 100) / 100;

      // Ajuste de redondeo para la última cuota
      if (period === termMonths) {
        principal = remainingBalance;
        remainingBalance = 0;
      } else {
        remainingBalance = Math.round((remainingBalance - principal) * 100) / 100;
      }

      totalInterest += interest;

      schedule.push({
        installmentNumber: period,
        payment: Math.round((principal + interest) * 100) / 100,
        interest,
        principal,
        remainingBalance: Math.max(0, remainingBalance),
      });
    }

    return {
      amount,
      termMonths,
      monthlyInterestRate: this.MONTHLY_INTEREST_RATE,
      monthlyInstallment,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalPayment: Math.round((amount + totalInterest) * 100) / 100,
      schedule,
    };
  }
}