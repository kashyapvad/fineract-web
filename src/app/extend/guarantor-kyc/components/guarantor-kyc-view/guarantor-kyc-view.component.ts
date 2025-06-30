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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GuarantorKycService } from '../../services/guarantor-kyc.service';
import {
  KycVerificationDialogComponent,
  KycVerificationDialogResult
} from '../../../kyc/components/kyc-verification-dialog/kyc-verification-dialog.component';
import { GuarantorKycDialogAdapterService } from '../../services/guarantor-kyc-dialog-adapter.service';

// Angular and Material imports - specific imports to avoid circular dependencies
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

// Custom Pipes
import { RelationshipDisplayPipe } from 'app/pipes/relationship-display.pipe';

@Component({
  selector: 'mifosx-guarantor-kyc-view',
  templateUrl: './guarantor-kyc-view.component.html',
  styleUrls: ['./guarantor-kyc-view.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    FontAwesomeModule,
    TranslateModule,
    RelationshipDisplayPipe
  ]
})
export class GuarantorKycViewComponent implements OnInit, OnDestroy {
  /** Route Parameters */
  clientId: number;
  guarantorKycId: number;

  /** Component Data */
  guarantorKycData: any = {};
  clientData: any;

  /** Reactive Forms */
  guarantorKycForm: FormGroup;

  /** Component State */
  isLoading = false;
  isEditMode = false;
  hasExistingData = false;
  isVerificationInProgress = false;

  /** Relationship Options */
  relationshipOptions = [
    { value: 'Spouse', label: 'Spouse' },
    { value: 'Parent', label: 'Parent' },
    { value: 'Sibling', label: 'Sibling' },
    { value: 'Business Associate', label: 'Business Associate' },
    { value: 'Other', label: 'Other' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private guarantorKycService: GuarantorKycService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private dialogAdapter: GuarantorKycDialogAdapterService
  ) {
    // Get route parameters
    this.clientId = this.route.parent?.snapshot.params['clientId'];
    this.guarantorKycId = this.route.snapshot.params['guarantorKycId'];

    this.createForm();
  }

  ngOnInit(): void {
    if (this.clientId && this.guarantorKycId) {
      this.loadGuarantorKycData();
      this.loadClientData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Creates the reactive form
   */
  private createForm(): void {
    this.guarantorKycForm = this.formBuilder.group({
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
      isPrimaryGuarantor: [false],
      isActive: [true],
      verificationNotes: [
        '',
        Validators.maxLength(1000)]
    });
  }

  /**
   * Loads guarantor KYC data
   */
  private loadGuarantorKycData(): void {
    this.isLoading = true;
    this.guarantorKycService
      .getGuarantorKyc(this.clientId, this.guarantorKycId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.guarantorKycData = data;
          this.hasExistingData = true;
          this.populateForm(data);
          this.isLoading = false;
        },
        error: (error) => {
          this.showError('Error loading guarantor KYC data');
          this.isLoading = false;
        }
      });
  }

  /**
   * Loads client data for display
   */
  private loadClientData(): void {
    // For now, set minimal client data
    this.clientData = {
      id: this.clientId,
      displayName: `Client ${this.clientId}`,
      accountNo: `000000${this.clientId.toString().padStart(3, '0')}`
    };
  }

  /**
   * Populates form with existing data
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
   * Toggles edit mode
   */
  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      // Reset form to original data when canceling edit
      this.populateForm(this.guarantorKycData);
    }
  }

  /**
   * Saves guarantor KYC details
   */
  saveGuarantorKycDetails(): void {
    if (this.guarantorKycForm.valid) {
      this.isLoading = true;
      const formData = this.guarantorKycForm.value;

      this.guarantorKycService
        .updateGuarantorKyc(this.clientId, this.guarantorKycId, formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.showSuccess('Guarantor KYC updated successfully');
            this.loadGuarantorKycData(); // Refresh data
            this.isEditMode = false;
            this.isLoading = false;
          },
          error: (error) => {
            this.showError('Error updating guarantor KYC data');
            this.isLoading = false;
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Opens manual verification dialog
   */
  openManualVerificationDialog(): void {
    // Validate guarantor data first
    const validation = this.dialogAdapter.validateGuarantorDataForVerification(this.guarantorKycData);
    if (!validation.valid) {
      this.showError(validation.errors.join(', '));
      return;
    }

    // Adapt guarantor data for KYC dialog
    const dialogData = this.dialogAdapter.adaptGuarantorDataForDialog(
      this.guarantorKycData,
      this.clientId,
      `Client ${this.clientId}`,
      'verify'
    );

    const dialogRef = this.dialog.open(KycVerificationDialogComponent, {
      width: '600px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result: KycVerificationDialogResult) => {
      if (result && result.action === 'verify') {
        // Adapt dialog result back to guarantor service format
        const serviceData = this.dialogAdapter.adaptDialogResultForGuarantorService(result, this.guarantorKycId);
        this.performManualVerification(serviceData);
      }
    });
  }

  /**
   * Performs manual verification using service call
   */
  private performManualVerification(serviceData: any): void {
    this.isVerificationInProgress = true;
    this.guarantorKycService
      .verifyManual(this.clientId, this.guarantorKycId, serviceData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.showSuccess('Manual verification completed successfully');
          this.loadGuarantorKycData();
          this.isVerificationInProgress = false;
        },
        error: (error) => {
          this.showError('Manual verification failed');
          this.isVerificationInProgress = false;
        }
      });
  }

  /**
   * Performs API verification
   */
  performApiVerification(): void {
    // Validate guarantor data first
    const validation = this.dialogAdapter.validateGuarantorDataForVerification(this.guarantorKycData);
    if (!validation.valid) {
      this.showError(validation.errors.join(', '));
      return;
    }

    // Adapt guarantor data for KYC dialog - API verification type
    const dialogData = this.dialogAdapter.adaptGuarantorDataForDialog(
      this.guarantorKycData,
      this.clientId,
      `Client ${this.clientId}`,
      'api-verify'
    );

    const dialogRef = this.dialog.open(KycVerificationDialogComponent, {
      width: '600px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result: KycVerificationDialogResult) => {
      if (result && result.action === 'api-verify') {
        // Adapt dialog result back to guarantor service format
        const serviceData = this.dialogAdapter.adaptDialogResultForGuarantorService(result, this.guarantorKycId);
        this.performActualApiVerification(serviceData);
      }
    });
  }

  /**
   * Performs the actual API verification call
   */
  private performActualApiVerification(serviceData: any): void {
    this.isVerificationInProgress = true;
    this.guarantorKycService
      .verifyAadhaarApi(this.clientId, this.guarantorKycId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.showSuccess('API verification completed successfully');
          this.loadGuarantorKycData();
          this.isVerificationInProgress = false;
        },
        error: (error) => {
          this.showError('API verification failed');
          this.isVerificationInProgress = false;
        }
      });
  }

  /**
   * Opens OTP verification dialog
   */
  openOtpVerificationDialog(): void {
    // Validate guarantor data first
    const validation = this.dialogAdapter.validateGuarantorDataForVerification(this.guarantorKycData);
    if (!validation.valid) {
      this.showError(validation.errors.join(', '));
      return;
    }

    // Adapt guarantor data for KYC dialog - OTP verification type
    const dialogData = this.dialogAdapter.adaptGuarantorDataForDialog(
      this.guarantorKycData,
      this.clientId,
      `Client ${this.clientId}`,
      'otp-verify'
    );

    const dialogRef = this.dialog.open(KycVerificationDialogComponent, {
      width: '600px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result: KycVerificationDialogResult) => {
      if (result && result.action === 'otp-verify') {
        // For OTP verification, first generate OTP, then show input dialog
        this.performOtpVerification(result.notes);
      }
    });
  }

  /**
   * Performs OTP verification process - following client KYC pattern
   */
  private performOtpVerification(notes: string): void {
    this.isVerificationInProgress = true;

    this.snackBar.open('Generating OTP for Aadhaar verification...', 'Close', { duration: 3000 });

    // First generate OTP
    this.guarantorKycService
      .generateOtp(this.clientId, this.guarantorKycId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          // Show OTP input dialog using same pattern as client KYC
          this.showOtpInputDialog(notes);
        },
        error: (error) => {
          this.showError('OTP generation failed');
          this.isVerificationInProgress = false;
        }
      });
  }

  /**
   * Shows OTP input dialog - following exact client KYC pattern
   */
  private showOtpInputDialog(notes: string): void {
    const otpInput = prompt('Enter 6-digit OTP received on your mobile:');

    if (otpInput) {
      this.snackBar.open('Verifying OTP...', 'Close', { duration: 3000 });

      this.guarantorKycService
        .verifyOtp(this.clientId, this.guarantorKycId, otpInput)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            // Refresh guarantor KYC data to get latest verification status
            this.loadGuarantorKycData();
            this.showSuccess('Aadhaar OTP verification completed successfully');
            this.isVerificationInProgress = false;
          },
          error: (error) => {
            this.showError('OTP verification failed');
            this.isVerificationInProgress = false;
          }
        });
    } else {
      this.isVerificationInProgress = false;
    }
  }

  /**
   * Navigates back to guarantor KYC list
   */
  goBack(): void {
    this.router.navigate([
      '/clients',
      this.clientId,
      'guarantor-kyc'
    ]);
  }

  /**
   * Gets verification status display information
   */
  getVerificationStatus(): { text: string; color: string; icon: string } {
    const panVerified = this.guarantorKycData.panVerified;
    // Consider Aadhaar verified if ANY of the three verification types are true
    const aadhaarVerified =
      this.guarantorKycData.aadhaarVerified ||
      this.guarantorKycData.aadhaarManuallyVerified ||
      this.guarantorKycData.aadhaarOtpVerified;

    if (panVerified && aadhaarVerified) {
      return { text: 'Fully Verified', color: 'primary', icon: 'verified' };
    } else if (panVerified) {
      return { text: 'PAN Verified', color: 'accent', icon: 'credit_card' };
    } else if (aadhaarVerified) {
      return { text: 'Aadhaar Verified', color: 'accent', icon: 'fingerprint' };
    } else {
      return { text: 'Unverified', color: 'warn', icon: 'warning' };
    }
  }

  /**
   * Checks if guarantor is fully verified (both PAN and Aadhaar)
   * Following client KYC pattern - requires both primary documents to be verified
   */
  isGuarantorVerified(): boolean {
    if (!this.guarantorKycData) {
      return false;
    }

    // Following client KYC pattern: both PAN and Aadhaar must be verified for full verification
    const panVerified = this.guarantorKycData.panVerified || false;
    // Consider Aadhaar verified if ANY of the three verification types are true
    const aadhaarVerified =
      this.guarantorKycData.aadhaarVerified ||
      this.guarantorKycData.aadhaarManuallyVerified ||
      this.guarantorKycData.aadhaarOtpVerified ||
      false;

    return panVerified && aadhaarVerified;
  }

  /**
   * Checks if guarantor has any verified documents (for partial verification display)
   */
  hasAnyVerifiedDocuments(): boolean {
    if (!this.guarantorKycData) {
      return false;
    }
    // Consider Aadhaar verified if ANY of the three verification types are true
    const aadhaarVerified =
      this.guarantorKycData.aadhaarVerified ||
      this.guarantorKycData.aadhaarManuallyVerified ||
      this.guarantorKycData.aadhaarOtpVerified;
    return this.guarantorKycData.panVerified || aadhaarVerified;
  }

  /**
   * Checks if API verification is available
   */
  canPerformApiVerification(): boolean {
    // API verification is available if Aadhaar number exists and no verification has been done yet
    const aadhaarVerified =
      this.guarantorKycData.aadhaarVerified ||
      this.guarantorKycData.aadhaarManuallyVerified ||
      this.guarantorKycData.aadhaarOtpVerified;
    return this.guarantorKycData.aadhaarNumber && !aadhaarVerified;
  }

  /**
   * Checks if OTP verification is available
   */
  canPerformOtpVerification(): boolean {
    // OTP verification is available if Aadhaar number exists and no verification has been done yet
    const aadhaarVerified =
      this.guarantorKycData.aadhaarVerified ||
      this.guarantorKycData.aadhaarManuallyVerified ||
      this.guarantorKycData.aadhaarOtpVerified;
    return this.guarantorKycData.aadhaarNumber && !aadhaarVerified;
  }

  /**
   * Gets the verification method for Aadhaar display
   */
  getAadhaarVerificationMethod(): string {
    if (!this.guarantorKycData) return '';

    if (this.guarantorKycData.aadhaarOtpVerified) {
      return ' (OTP)';
    } else if (this.guarantorKycData.aadhaarVerified) {
      return ' (API)';
    } else if (this.guarantorKycData.aadhaarManuallyVerified) {
      return ' (Manual)';
    }
    return '';
  }

  /**
   * Gets the verification method for PAN display
   */
  getPanVerificationMethod(): string {
    if (!this.guarantorKycData) return '';

    if (this.guarantorKycData.panVerified) {
      // PAN can be verified via API or Manual - check verification method
      if (this.guarantorKycData.verificationMethod === 'API') {
        return ' (API)';
      } else {
        return ' (Manual)';
      }
    }
    return '';
  }

  /**
   * Form validation helpers
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.guarantorKycForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

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
    if (errors['maxlength']) return `Maximum length is ${errors['maxlength'].requiredLength}`;

    return 'Invalid input';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.guarantorKycForm.controls).forEach((key) => {
      this.guarantorKycForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Utility methods for user feedback
   */
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Initiates manual unverification for documents - following client KYC pattern
   */
  unverifyGuarantorKycManually(): void {
    if (!this.hasExistingData) {
      this.showError('No guarantor KYC details available for unverification');
      return;
    }

    // Validate guarantor data first
    const validation = this.dialogAdapter.validateGuarantorDataForVerification(this.guarantorKycData);
    if (!validation.valid) {
      this.showError(validation.errors.join(', '));
      return;
    }

    // Adapt guarantor data for KYC dialog - unverify type
    const dialogData = this.dialogAdapter.adaptGuarantorDataForDialog(
      this.guarantorKycData,
      this.clientId,
      `Client ${this.clientId}`,
      'unverify'
    );

    const dialogRef = this.dialog.open(KycVerificationDialogComponent, {
      width: '600px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result: KycVerificationDialogResult) => {
      if (result && result.action === 'unverify') {
        // Adapt dialog result back to guarantor service format
        const serviceData = this.dialogAdapter.adaptDialogResultForGuarantorService(result, this.guarantorKycId);
        this.performManualUnverification(serviceData, result.reason || '', result.notes);
      }
    });
  }

  /**
   * Performs manual unverification - following client KYC pattern
   */
  private performManualUnverification(serviceData: any, reason: string, notes: string): void {
    this.isVerificationInProgress = true;

    // Prepare unverification data following client KYC pattern
    const unverificationData = {
      reason: notes, // Use notes as reason since we consolidated the fields
      notes: notes,
      ...serviceData
    };

    this.guarantorKycService
      .unverifyManual(this.clientId, this.guarantorKycId, unverificationData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.showSuccess('Manual unverification completed successfully');
          this.loadGuarantorKycData(); // Refresh data to show updated verification status
          this.isVerificationInProgress = false;
        },
        error: (error) => {
          this.showError('Manual unverification failed');
          this.isVerificationInProgress = false;
        }
      });
  }
}
