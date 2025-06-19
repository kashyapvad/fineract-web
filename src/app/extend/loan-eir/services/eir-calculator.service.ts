import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface EirCalculationRequest {
  loanId: number;
  calculationDate?: string;
  principalAmount?: number;
  netDisbursementAmount?: number;
  emiAmount?: number;
  tenureInMonths?: number;
  numberOfInstallments?: number;
  currencyCode?: string;
  calculationMethod?: string;
  generationType?: string;
}

interface EirCalculationResponse {
  id: number;
  loanId: number;
  effectiveInterestRate: number;
  calculationDate: string;
  calculationMethod: string;
  formulaUsed: string;
}

@Injectable({
  providedIn: 'root'
})
export class EirCalculatorService {
  constructor(private http: HttpClient) {}

  /**
   * Create a new EIR calculation
   * @param request EIR calculation request data
   * @returns Observable<any> - Returns creation result with resourceId
   */
  createEirCalculation(request: EirCalculationRequest): Observable<any> {
    const url = `/extend/loans/${request.loanId}/eir-calculations`;

    // Send minimal payload - backend should fetch loan data and calculate everything
    const calculationData = {};

    return this.http.post<any>(url, calculationData);
  }

  /**
   * Get latest EIR calculation for a loan
   * @param loanId Loan ID
   * @returns Observable<EirCalculationResponse>
   */
  getLatestEirCalculation(loanId: number): Observable<EirCalculationResponse> {
    const url = `/extend/loans/${loanId}/eir-calculations/latest`;
    return this.http.get<EirCalculationResponse>(url);
  }

  /**
   * Frontend EIR calculation using IRR formula (as fallback)
   * @param loanData Loan data
   * @returns Calculated EIR percentage
   */
  calculateEirFrontend(loanData: any): number {
    try {
      const principal = loanData.principal || 0;
      const netDisbursement = loanData.netDisbursalAmount || principal;
      const termInMonths = loanData.termInMonths || 1;

      // Extract actual payment amounts from repayment schedule
      let paymentSchedule: number[] = [];

      if (loanData.repaymentSchedule?.periods?.length > 0) {
        const periods = loanData.repaymentSchedule.periods.filter((p: any) => p.period > 0);

        periods.forEach((period: any) => {
          const payment = period.totalDueForPeriod || period.totalInstallmentAmountForPeriod || 0;
          paymentSchedule.push(payment);
        });
      }

      // Fallback if no payment schedule found
      if (paymentSchedule.length === 0) {
        const fallbackEmi = loanData.emiAmount || 0;
        if (fallbackEmi > 0) {
          paymentSchedule = Array(termInMonths).fill(fallbackEmi);
        } else {
          // Calculate EMI as fallback
          const interestRate = loanData.interestRatePerPeriod || loanData.annualInterestRate || 0;
          let fallbackEmi = 0;

          if (interestRate === 0) {
            fallbackEmi = principal / termInMonths;
          } else {
            let monthlyRate = interestRate;
            if (interestRate > 2) {
              // Assume annual rate if > 2%
              monthlyRate = interestRate / 12;
            }
            monthlyRate = monthlyRate / 100;

            fallbackEmi =
              (principal * monthlyRate * Math.pow(1 + monthlyRate, termInMonths)) /
              (Math.pow(1 + monthlyRate, termInMonths) - 1);
          }

          paymentSchedule = Array(termInMonths).fill(fallbackEmi);
        }
      }

      // Use net disbursement directly (already after charges)
      const actualDisbursement = netDisbursement;
      const totalPayments = paymentSchedule.reduce((sum, payment) => sum + payment, 0);

      if (actualDisbursement <= 0 || paymentSchedule.length === 0 || totalPayments <= 0) {
        return 0;
      }

      // Calculate IRR using Newton-Raphson method
      let irr = 0.01; // Initial guess (1% monthly)
      const tolerance = 0.0001;
      const maxIterations = 100;

      for (let i = 0; i < maxIterations; i++) {
        let npv = -actualDisbursement;
        let npvDerivative = 0;

        paymentSchedule.forEach((payment, index) => {
          const month = index + 1;
          const factor = Math.pow(1 + irr, month);
          npv += payment / factor;
          npvDerivative -= (month * payment) / (factor * (1 + irr));
        });

        if (Math.abs(npv) < tolerance) {
          break;
        }

        if (npvDerivative === 0) {
          break;
        }

        irr = irr - npv / npvDerivative;

        // Prevent negative or extremely high IRR
        if (irr < 0) irr = 0.001;
        if (irr > 1) irr = 0.5;
      }

      // Convert monthly IRR to annual EIR percentage
      const annualEir = (Math.pow(1 + irr, 12) - 1) * 100;

      return Math.round(annualEir * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      console.error('EIR calculation error:', error);
      return 0;
    }
  }
}
