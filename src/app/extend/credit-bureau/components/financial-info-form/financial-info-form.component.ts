import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CreditReportValidationService } from '../../services/credit-report-validation.service';

/**
 * Focused component for managing financial information in credit reports.
 *
 * Following Angular Architecture KB: Component Responsibility Separation
 * Following Performance KB: Change Detection Optimization
 * - Single responsibility: Financial information management
 * - OnPush change detection for performance
 * - Clean input interface
 */
@Component({
  selector: 'mifosx-financial-info-form',
  templateUrl: './financial-info-form.component.html',
  styleUrls: ['./financial-info-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancialInfoFormComponent implements OnInit {
  @Input() parentForm!: FormGroup;

  constructor(private validationService: CreditReportValidationService) {}

  ngOnInit(): void {
    this.initializeValidators();
  }

  /**
   * Initialize form validators for financial information fields
   * Following UI Components KB: Form Validation Patterns
   */
  private initializeValidators(): void {
    const financialFields = [
      'totalAccounts',
      'activeAccounts',
      'closedAccounts',
      'overdueAccounts',
      'totalCreditLimit',
      'totalOutstandingAmount',
      'totalOverdueAmount',
      'highestCreditAmount'
    ];

    financialFields.forEach((field) => {
      const control = this.parentForm.get(field);
      if (control) {
        control.setValidators([Validators.min(0)]);
      }
    });
  }

  /**
   * Get error message for a specific field
   * Following UI Components KB: Form Validation Patterns
   */
  getErrorMessage(controlName: string): string {
    return this.validationService.getErrorMessage(this.parentForm, controlName);
  }

  /**
   * Mark all financial info fields as touched for validation
   * Following UI Components KB: Form Validation Patterns
   */
  markAllAsTouched(): void {
    const financialFields = [
      'totalAccounts',
      'activeAccounts',
      'closedAccounts',
      'overdueAccounts',
      'totalCreditLimit',
      'totalOutstandingAmount',
      'totalOverdueAmount',
      'highestCreditAmount'
    ];

    financialFields.forEach((field) => {
      const control = this.parentForm.get(field);
      if (control) {
        control.markAsTouched();
      }
    });
  }
}
