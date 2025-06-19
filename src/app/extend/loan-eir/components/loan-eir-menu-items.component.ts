import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EirCalculatorService } from '../services/eir-calculator.service';
import { KfsTemplateService } from '../services/kfs-template.service';
import { KfsModalComponent } from './kfs-modal/kfs-modal.component';

/**
 * Loan EIR Menu Items Component
 *
 * Angular component that provides EIR/KFS menu items with proper business logic.
 * Separates presentation from the structural directive for better maintainability.
 *
 * Following Angular Architecture Patterns:
 * - Smart component with business logic
 * - Service layer abstraction
 * - Proper error handling and user feedback
 * - Optimized DB calls - only fetch data when actually needed
 */
@Component({
  selector: 'mifosx-loan-eir-menu-items',
  template: `
    <ng-container *ngIf="showCalculateEir">
      <button mat-menu-item (click)="handleCalculateEir()">
        <span>Calculate EIR</span>
      </button>
    </ng-container>

    <ng-container *ngIf="showExportKfs">
      <button
        mat-menu-item
        [disabled]="!hasUploadedTemplate"
        [matTooltip]="hasUploadedTemplate ? 'Export KFS document' : 'Please upload a KFS template first'"
        matTooltipPosition="left"
        (click)="handleExportKfs()"
      >
        <span>Export KFS</span>
      </button>
    </ng-container>
  `
})
export class LoanEirMenuItemsComponent implements OnInit {
  @Input() loanData: any;
  @Input() showCalculateEir = false;
  @Input() showExportKfs = false;

  hasUploadedTemplate = false;
  private lastEirCalculation: any = null; // Cache last calculation to avoid redundant API calls

  constructor(
    private dialog: MatDialog,
    private eirCalculatorService: EirCalculatorService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Template availability checking removed since upload functionality is disabled
    // Export KFS will work with default templates
    this.hasUploadedTemplate = true; // Always allow export with default template
  }

  handleCalculateEir(): void {
    // Minimal request - backend will fetch all loan data and calculate EIR
    const calculationRequest = {
      loanId: this.loanData.id
    };

    // Call the CREATE endpoint - backend handles everything
    this.eirCalculatorService.createEirCalculation(calculationRequest).subscribe({
      next: (response: any) => {
        // After successful creation, fetch the calculation result
        this.eirCalculatorService.getLatestEirCalculation(this.loanData.id).subscribe({
          next: (calculation: any) => {
            this.lastEirCalculation = calculation; // Cache the result
            this.showEirResult(calculation);
            this.openKfsModal(calculation);
          },
          error: (error: any) => {
            this.snackBar.open('Failed to fetch EIR calculation result. Please try again.', 'Close', {
              duration: 5000
            });
          }
        });
      },
      error: (error: any) => {
        // Fallback to frontend calculation
        const frontendResult = this.calculateEirFrontend(calculationRequest);

        // Cache and show the result
        this.lastEirCalculation = frontendResult;
        this.showEirResult(frontendResult);
        this.openKfsModal(frontendResult);

        this.snackBar.open(`Service unavailable using estimation: ${frontendResult.effectiveInterestRate}%`, 'Close', {
          duration: 6000
        });
      }
    });
  }

  handleExportKfs(): void {
    // Check if template is available before attempting export
    if (!this.hasUploadedTemplate) {
      this.snackBar.open('Please upload a KFS template first before exporting', 'Close', { duration: 5000 });
      return;
    }

    // Use cached calculation if available to avoid redundant API call
    if (this.lastEirCalculation) {
      this.openKfsModal(this.lastEirCalculation);
      return;
    }

    // Only fetch if no cached calculation available
    this.eirCalculatorService.getLatestEirCalculation(this.loanData.id).subscribe({
      next: (eirData: any) => {
        this.lastEirCalculation = eirData; // Cache for future use
        this.openKfsModal(eirData);
      },
      error: () => {
        // No existing calculation, calculate first
        this.handleCalculateEir();
      }
    });
  }

  private showEirResult(eirResponse: any): void {
    const eirValue = eirResponse?.effectiveInterestRate || 0;

    this.snackBar.open(`EIR calculated: ${eirValue}%`, 'Close', { duration: 4000 });
  }

  private openKfsModal(eirData: any): void {
    // Enhance eirData with loan information if missing
    const enhancedEirData = {
      ...eirData,
      loanData: this.loanData,
      nominalInterestRate:
        eirData.nominalInterestRate || this.loanData?.annualInterestRate || this.loanData?.interestRatePerAnnum || 0,
      principalAmount: eirData.principalAmount || this.loanData?.principal || this.loanData?.approvedPrincipal || 0
    };

    const dialogRef = this.dialog.open(KfsModalComponent, {
      width: '90vw',
      maxWidth: '1200px',
      height: '80vh',
      data: {
        loanData: this.loanData,
        eirCalculationData: enhancedEirData
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'exported') {
        this.snackBar.open('KFS document exported successfully', 'Close', { duration: 3000 });
      }
    });
  }

  private getEmiFromRepaymentSchedule(): number {
    // Extract EMI directly from the first repayment period
    if (this.loanData.repaymentSchedule?.periods?.length > 0) {
      const periods = this.loanData.repaymentSchedule.periods.filter((p: any) => p.period > 0);
      if (periods.length > 0) {
        const firstPeriod = periods[0];
        return firstPeriod.totalDueForPeriod || firstPeriod.totalInstallmentAmountForPeriod || 0;
      }
    }

    // Fallback calculation
    return this.loanData.principal && this.loanData.termInMonths
      ? this.loanData.principal / this.loanData.termInMonths
      : 0;
  }

  private calculateEirFrontend(calculationRequest: any): any {
    const calculatedEir = this.eirCalculatorService.calculateEirFrontend(this.loanData);

    return {
      effectiveInterestRate: calculatedEir,
      calculationDate: new Date().toISOString().split('T')[0],
      currencyCode: calculationRequest.currencyCode || 'INR',
      principalAmount: this.loanData?.principal || this.loanData?.approvedPrincipal || 0,
      nominalInterestRate: this.loanData?.annualInterestRate || this.loanData?.interestRatePerPeriod || 0,
      netDisbursementAmount: this.loanData?.principal || 0,
      emiAmount: this.getEmiFromRepaymentSchedule(),
      tenureInMonths: this.loanData?.termInMonths || this.loanData?.numberOfRepayments || 0,
      calculationMethod: 'IRR_METHOD',
      formulaUsed: 'IRR (Frontend)',
      calculationStatus: 'COMPLETED'
    };
  }
}
