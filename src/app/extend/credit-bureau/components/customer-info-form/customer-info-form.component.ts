import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CreditReportValidationService } from '../../services/credit-report-validation.service';

/**
 * Focused component for managing customer information in credit reports.
 *
 * Following Angular Architecture KB: Component Responsibility Separation
 * Following Performance KB: Change Detection Optimization
 * - Single responsibility: Customer information management
 * - OnPush change detection for performance
 * - Clean input interface
 */
@Component({
  selector: 'mifosx-customer-info-form',
  templateUrl: './customer-info-form.component.html',
  styleUrls: ['./customer-info-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerInfoFormComponent implements OnInit {
  @Input() parentForm!: FormGroup;

  // Gender options for dropdown
  genderOptions = [
    { code: 'MALE', description: 'Male' },
    { code: 'FEMALE', description: 'Female' },
    { code: 'OTHER', description: 'Other' }
  ];

  constructor(private validationService: CreditReportValidationService) {}

  ngOnInit(): void {
    this.initializeValidators();
  }

  /**
   * Initialize form validators for customer information fields
   * Following UI Components KB: Form Validation Patterns
   */
  private initializeValidators(): void {
    // PAN validation pattern
    const panControl = this.parentForm.get('customerPan');
    if (panControl) {
      panControl.setValidators([Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]);
    }

    // Aadhaar validation pattern
    const aadhaarControl = this.parentForm.get('customerAadhaar');
    if (aadhaarControl) {
      aadhaarControl.setValidators([Validators.pattern(/^\d{12}$/)]);
    }

    // Mobile validation pattern
    const mobileControl = this.parentForm.get('customerMobile');
    if (mobileControl) {
      mobileControl.setValidators([Validators.pattern(/^\d{10}$/)]);
    }
  }

  /**
   * Get error message for a specific field
   * Following UI Components KB: Form Validation Patterns
   */
  getErrorMessage(controlName: string): string {
    return this.validationService.getErrorMessage(this.parentForm, controlName);
  }

  /**
   * Mark all customer info fields as touched for validation
   * Following UI Components KB: Form Validation Patterns
   */
  markAllAsTouched(): void {
    const customerFields = [
      'customerName',
      'customerPan',
      'customerAadhaar',
      'customerMobile',
      'customerAddress',
      'dateOfBirth',
      'gender'
    ];

    customerFields.forEach((field) => {
      const control = this.parentForm.get(field);
      if (control) {
        control.markAsTouched();
      }
    });
  }
}
