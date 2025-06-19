import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { KfsTemplateService } from '../../services/kfs-template.service';
import { EirCalculatorService } from '../../services/eir-calculator.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientsService } from '../../../../clients/clients.service';

interface KfsModalData {
  loanData: any;
  eirCalculationData: any;
}

@Component({
  selector: 'mifosx-kfs-modal',
  templateUrl: './kfs-modal.component.html',
  styleUrls: ['./kfs-modal.component.scss']
})
export class KfsModalComponent implements OnInit {
  loanData: any;
  eirCalculationData: any;
  clientData: any = null;
  isLoading = false;
  exportFormats = ['DOCX'];
  selectedFormat: 'DOCX' = 'DOCX';
  templateFormat: string = 'HTML'; // Track the original template format

  constructor(
    public dialogRef: MatDialogRef<KfsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: KfsModalData,
    private kfsTemplateService: KfsTemplateService,
    private eirCalculatorService: EirCalculatorService,
    private snackBar: MatSnackBar,
    private clientsService: ClientsService
  ) {
    this.loanData = data.loanData;
    this.eirCalculationData = data.eirCalculationData;
  }

  ngOnInit(): void {
    // Initialize modal data
    this.validateModalData();
    // Fetch client data if not available in loan data
    this.fetchClientDataIfNeeded();
    // Fetch template format for tooltip
    this.fetchTemplateFormat();
  }

  private validateModalData(): void {
    if (!this.loanData) {
      this.snackBar.open('Invalid loan data provided to KFS modal', 'Close', { duration: 5000 });
      this.dialogRef.close();
      return;
    }

    if (!this.eirCalculationData) {
      // If no EIR calculation data, calculate it using frontend method
      this.calculateEirFrontend();
    }
  }

  private fetchClientDataIfNeeded(): void {
    // Check if mobile number or email is missing from loan data
    const needsClientData =
      (!this.loanData?.client?.mobileNo && !this.loanData?.mobileNo) ||
      (!this.loanData?.client?.emailAddress && !this.loanData?.emailAddress);

    if (needsClientData && this.loanData?.clientId) {
      this.isLoading = true;
      this.clientsService.getClientData(this.loanData.clientId.toString()).subscribe({
        next: (clientData) => {
          this.clientData = clientData;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to fetch client data:', error);
          this.isLoading = false;
          // Continue without client data - will show N/A
        }
      });
    }
  }

  private fetchTemplateFormat(): void {
    if (this.loanData?.id) {
      this.kfsTemplateService.getTemplateFormat(this.loanData.id).subscribe({
        next: (format) => {
          this.templateFormat = format;
        },
        error: (error) => {
          console.error('Failed to fetch template format:', error);
          this.templateFormat = 'HTML'; // Default fallback
        }
      });
    }
  }

  private calculateEirFrontend(): void {
    this.isLoading = true;

    const frontendResult = this.eirCalculatorService.calculateEirFrontend(this.loanData);
    const emiAmount = this.calculateEmiAmount();
    const tenureInMonths = this.loanData.termInMonths || this.loanData.numberOfRepayments || 0;

    this.eirCalculationData = {
      effectiveInterestRate: frontendResult,
      calculationDate: new Date().toISOString().split('T')[0],
      currencyCode: this.loanData.currency?.code || 'INR',
      calculationMethod: 'IRR_METHOD',
      formulaUsed: 'IRR (Frontend)',
      calculationStatus: 'COMPLETED',
      emiAmount: emiAmount,
      principalAmount: this.loanData.principal || 0,
      netDisbursementAmount: this.loanData.netDisbursalAmount || this.loanData.principal || 0,
      tenureInMonths: tenureInMonths
    };

    this.isLoading = false;
  }

  private calculateEmiAmount(): number {
    if (this.loanData.repaymentSchedule?.periods?.length > 0) {
      const periods = this.loanData.repaymentSchedule.periods.filter((p: any) => p.period > 0);
      if (periods.length > 0) {
        const firstPeriod = periods[0];
        return firstPeriod.totalDueForPeriod || firstPeriod.totalInstallmentAmountForPeriod || 0;
      }
    }

    // Simple fallback calculation
    const principal = this.loanData.principal || 0;
    const termInMonths = this.loanData.termInMonths || 1;
    return principal / termInMonths;
  }

  onExport(): void {
    if (!this.eirCalculationData) {
      this.snackBar.open('EIR calculation data not available. Please calculate EIR first.', 'Close', {
        duration: 5000
      });
      return;
    }

    this.isLoading = true;

    this.kfsTemplateService
      .exportKfsDocument(this.loanData.id, this.selectedFormat, this.eirCalculationData)
      .subscribe({
        next: (result) => {
          // Generate filename based on whether fallback was used
          const filename = this.kfsTemplateService.generateFilename(
            this.loanData.id,
            this.loanData.clientName || this.loanData.client?.displayName || 'Client',
            this.selectedFormat,
            result.isFallback
          );

          this.kfsTemplateService.downloadFile(result.blob, filename);
          this.isLoading = false;

          const message = result.isFallback
            ? `KFS document exported as RTF (template not available)`
            : `KFS document exported successfully as ${this.selectedFormat}`;

          this.snackBar.open(message, 'Close', { duration: 3000 });

          // Close modal with success result
          this.dialogRef.close({
            action: 'exported',
            format: result.isFallback ? 'RTF' : this.selectedFormat,
            isFallback: result.isFallback
          });
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(error.error?.defaultUserMessage || 'Export failed', 'Close', { duration: 5000 });
        }
      });
  }

  onPrint(): void {
    window.print();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  getExportTooltip(): string {
    if (this.templateFormat === 'DOCX') {
      return 'DOCX templates yield better results with superior formatting and layout preservation';
    } else if (this.templateFormat === 'PDF') {
      return 'PDF templates provide good results but may have some formatting limitations';
    } else {
      return 'HTML templates provide basic formatting. Consider uploading a DOCX template for better results';
    }
  }

  // Getter methods for template data binding - optimized for performance
  get clientName(): string {
    return this.loanData?.clientName || this.loanData?.client?.displayName || this.loanData?.client?.name || 'N/A';
  }

  get clientMobile(): string {
    return (
      this.loanData?.client?.mobileNo ||
      this.loanData?.mobileNo ||
      this.loanData?.client?.mobileNumber ||
      this.clientData?.mobileNo ||
      'N/A'
    );
  }

  get clientEmail(): string {
    return (
      this.loanData?.client?.emailAddress ||
      this.loanData?.emailAddress ||
      this.loanData?.client?.email ||
      this.clientData?.emailAddress ||
      'N/A'
    );
  }

  get loanProduct(): string {
    return this.loanData?.loanProductName || this.loanData?.productName || 'N/A';
  }

  get loanPurpose(): string {
    return this.loanData?.loanPurposeName || this.loanData?.purpose || 'N/A';
  }

  get currencyCode(): string {
    return this.loanData?.currency?.code || this.eirCalculationData?.currencyCode || 'INR';
  }

  get principalAmount(): number {
    return this.loanData?.principal || 0;
  }

  get approvedAmount(): number {
    return this.loanData?.approvedPrincipal || this.loanData?.principal || 0;
  }

  get disbursedAmount(): number {
    return (
      this.loanData?.totalDisbursed ||
      this.loanData?.disbursedAmount ||
      this.loanData?.netDisbursalAmount ||
      this.principalAmount
    );
  }

  get interestRate(): number {
    return this.loanData?.annualInterestRate || this.loanData?.interestRatePerPeriod || 0;
  }

  get termInMonths(): number {
    return this.loanData?.termInMonths || this.loanData?.numberOfRepayments || 0;
  }

  get effectiveInterestRate(): number {
    return this.eirCalculationData?.effectiveInterestRate || 0;
  }

  get totalCharges(): number {
    if (this.loanData?.charges?.length > 0) {
      return this.loanData.charges.reduce((total: number, charge: any) => {
        return total + (charge.amount || charge.amountOrPercentage || 0);
      }, 0);
    }
    return this.loanData?.totalCharges || 0;
  }

  get allCharges(): any[] {
    if (this.loanData?.charges?.length > 0) {
      return this.loanData.charges.map((charge: any) => ({
        name: charge.name,
        amount: charge.amount || charge.amountOrPercentage || 0,
        type: charge.chargeCalculationType?.value || 'Fixed',
        timeType: charge.chargeTimeType?.value || 'Other'
      }));
    }
    return [];
  }

  get emiAmount(): number {
    return this.eirCalculationData?.emiAmount || 0;
  }

  get repaymentFrequency(): string {
    return this.loanData?.repaymentFrequencyType?.value || this.loanData?.repaymentFrequency || 'Monthly';
  }

  get loanOfficer(): string {
    return this.loanData?.loanOfficerName || this.loanData?.officer?.displayName || 'N/A';
  }

  get disbursementDate(): string {
    return (
      this.loanData?.timeline?.actualDisbursementDate ||
      this.loanData?.timeline?.disbursedOnDate ||
      this.loanData?.disbursementDate ||
      ''
    );
  }

  get maturityDate(): string {
    return (
      this.loanData?.timeline?.expectedMaturityDate ||
      this.loanData?.timeline?.actualMaturityDate ||
      this.loanData?.maturityDate ||
      ''
    );
  }

  get loanStatus(): string {
    return this.loanData?.status?.value || this.loanData?.statusValue || 'N/A';
  }

  get repaymentStrategy(): string {
    return (
      this.loanData?.transactionProcessingStrategyName ||
      this.loanData?.transactionProcessingStrategy?.name ||
      this.loanData?.repaymentProcessingStrategy ||
      'N/A'
    );
  }

  get repaymentSchedule(): string {
    const numberOfRepayments = this.loanData?.numberOfRepayments || this.termInMonths;
    const frequency = this.repaymentFrequency;

    if (numberOfRepayments && frequency) {
      return `${numberOfRepayments} every 1 ${frequency === 'Monthly' ? 'Month' : frequency}${numberOfRepayments > 1 ? 's' : ''}`;
    }
    return 'N/A';
  }

  get amortizationType(): string {
    return this.loanData?.amortizationType?.value || this.loanData?.amortization || 'Equal installments';
  }

  get equalAmortization(): string {
    const isEqualAmortization =
      this.loanData?.equalAmortization ||
      this.loanData?.isEqualAmortization ||
      this.amortizationType.toLowerCase().includes('equal');
    return isEqualAmortization ? 'Yes' : 'No';
  }

  get interestDetails(): string {
    const rate = this.interestRate;
    const termInMonths = this.termInMonths;
    const wholeTerm = rate * (termInMonths / 12); // Approximate calculation

    if (rate && termInMonths) {
      return `${rate.toFixed(2)} % per annum (${wholeTerm.toFixed(0)} % Whole Term)`;
    }
    return 'N/A';
  }

  formatCurrency(amount: number): string {
    if (!amount) return `${this.currencyCode} 0.00`;

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: this.currencyCode,
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatPercentage(rate: number): string {
    if (!rate) return '0.00%';
    return `${rate.toFixed(2)}%`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  }
}
