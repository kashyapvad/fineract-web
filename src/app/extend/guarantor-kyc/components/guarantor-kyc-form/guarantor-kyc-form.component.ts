/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/** Angular Imports */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/** Custom Services */
import { GuarantorKycService } from '../../services/guarantor-kyc.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/** Extension Shared Imports */
import { EXTENSION_SHARED_IMPORTS } from '../../../shared/extension-imports';

/**
 * Guarantor KYC Form Component
 *
 * Comprehensive form for creating and editing guarantor KYC details including:
 * - Personal information (name, mobile, relationship)
 * - KYC documents (PAN, Aadhaar)
 * - Status settings (primary guarantor, active)
 * - Verification notes
 *
 * This component follows the exact fields defined in the guarantor KYC migration
 * and maintains consistency with the backend API structure.
 */
@Component({
  selector: 'mifosx-guarantor-kyc-form',
  templateUrl: './guarantor-kyc-form.component.html',
  styleUrls: ['./guarantor-kyc-form.component.scss'],
  standalone: true,
  imports: [
    ...EXTENSION_SHARED_IMPORTS
  ]
})
export class GuarantorKycFormComponent implements OnInit, OnDestroy {
  /** Form Groups */
  guarantorKycForm: FormGroup;

  /** Component Data */
  clientId: number;
  guarantorKycId: number;
  isEditMode = false;
  isLoading = false;
  guarantorKycData: any;

  /** Relationship Options - matching the database values */
  relationshipOptions = [
    { value: 'Spouse', label: 'Spouse' },
    { value: 'Parent', label: 'Parent' },
    { value: 'Sibling', label: 'Sibling' },
    { value: 'Business Associate', label: 'Business Associate' },
    { value: 'Other', label: 'Other' }
  ];

  /** Reactive Cleanup */
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private guarantorKycService: GuarantorKycService,
    private settingsService: SettingsService,
    private dateUtils: Dates
  ) {
    this.clientId = this.route.parent?.snapshot.params['clientId'];
    this.guarantorKycId = this.route.snapshot.params['guarantorKycId'];
    this.isEditMode = !!this.guarantorKycId;
  }

  ngOnInit(): void {
    this.createForm();
    if (this.isEditMode) {
      this.loadGuarantorKycData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Creates the reactive form with validation
   * Only includes fields that exist in the guarantor KYC migration table
   */
  private createForm(): void {
    this.guarantorKycForm = this.formBuilder.group({
      // Personal Information (Core Identity)
      fullName: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)]
      ],
      mobileNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{10}$/)]
      ],
      relationshipToClient: [
        '',
        Validators.maxLength(50)],

      // KYC Document Fields
      panNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)]
      ],
      aadhaarNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{12}$/)]
      ],

      // Status Fields
      isPrimaryGuarantor: [false],
      isActive: [true],

      // Notes
      verificationNotes: [
        '',
        Validators.maxLength(1000)]
    });
  }

  /**
   * Loads existing guarantor KYC data for editing
   */
  private loadGuarantorKycData(): void {
    this.isLoading = true;
    this.guarantorKycService
      .getGuarantorKyc(this.clientId, this.guarantorKycId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.guarantorKycData = data;
          this.populateForm(data);
          this.isLoading = false;
        },
        error: (error) => {
          const errorMessage = this.extractErrorMessage(error);
          this.showError(errorMessage);
          this.isLoading = false;
        }
      });
  }

  /**
   * Populates form with existing data
   * Only sets values for fields that exist in the form
   */
  private populateForm(data: any): void {
    this.guarantorKycForm.patchValue({
      fullName: data.fullName,
      mobileNumber: data.mobileNumber,
      relationshipToClient: data.relationshipToClient,
      panNumber: data.panNumber,
      aadhaarNumber: data.aadhaarNumber,
      isPrimaryGuarantor: data.isPrimaryGuarantor,
      isActive: data.isActive,
      verificationNotes: data.verificationNotes
    });
  }

  /**
   * Form submission handler
   */
  onSubmit(): void {
    if (this.guarantorKycForm.valid) {
      this.isLoading = true;
      const formData = this.prepareFormData();

      const operation = this.isEditMode
        ? this.guarantorKycService.updateGuarantorKyc(this.clientId, this.guarantorKycId, formData)
        : this.guarantorKycService.createGuarantorKyc(this.clientId, formData);

      operation.pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.showSuccess(
            this.isEditMode ? 'Guarantor KYC updated successfully' : 'Guarantor KYC created successfully'
          );
          this.router.navigate([
            '/clients',
            this.clientId,
            'guarantor-kyc'
          ]);
        },
        error: (error) => {
          const errorMessage = this.extractErrorMessage(error);
          this.showError(errorMessage);
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Prepares form data for submission
   * Only includes the fields that exist in the migration table
   */
  private prepareFormData(): any {
    const formValue = this.guarantorKycForm.value;
    return { ...formValue };
  }

  /**
   * Marks all form fields as touched to trigger validation display
   */
  private markFormGroupTouched(): void {
    Object.keys(this.guarantorKycForm.controls).forEach((key) => {
      this.guarantorKycForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Cancel handler - navigates back to guarantor KYC list
   */
  onCancel(): void {
    this.router.navigate([
      '/clients',
      this.clientId,
      'guarantor-kyc'
    ]);
  }

  /**
   * Checks if a form field has errors
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.guarantorKycForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Gets the error message for a form field
   */
  getFieldErrorMessage(fieldName: string): string {
    const field = this.guarantorKycForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;
    if (errors['required']) return `${fieldName} is required`;
    if (errors['pattern']) {
      if (fieldName === 'panNumber') return 'Invalid PAN format (e.g., ABCDE1234F)';
      if (fieldName === 'aadhaarNumber') return 'Invalid Aadhaar format (12 digits)';
      if (fieldName === 'mobileNumber') return 'Invalid mobile number (10 digits)';
    }
    if (errors['email']) return 'Invalid email format';
    if (errors['maxlength']) return `Maximum length is ${errors['maxlength'].requiredLength}`;

    return 'Invalid input';
  }

  /**
   * Shows success message
   */
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Shows error message
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Extracts user-friendly error message from backend error response
   */
  private extractErrorMessage(error: any): string {
    // Handle different error response formats
    if (error?.error) {
      // Check for user message (most user-friendly)
      if (error.error.userMessage) {
        return error.error.userMessage;
      }

      // Check for developer message
      if (error.error.developerMessage) {
        return error.error.developerMessage;
      }

      // Check for errors array (validation errors)
      if (error.error.errors && Array.isArray(error.error.errors) && error.error.errors.length > 0) {
        const firstError = error.error.errors[0];
        if (firstError.userMessage) {
          return firstError.userMessage;
        }
        if (firstError.developerMessage) {
          return firstError.developerMessage;
        }
      }

      // Check for direct message property
      if (error.error.message) {
        return error.error.message;
      }

      // If error.error is a string
      if (typeof error.error === 'string') {
        return error.error;
      }
    }

    // Check for direct message property
    if (error.message) {
      return error.message;
    }

    // Check for status-specific messages
    if (error.status === 400) {
      return 'Invalid data provided. Please check your input and try again.';
    }
    if (error.status === 409) {
      return 'This data conflicts with existing records. Please check for duplicates.';
    }
    if (error.status === 500) {
      return 'Server error occurred. Please try again later.';
    }

    // Default fallback message
    return 'Error saving guarantor KYC data. Please try again.';
  }
}
