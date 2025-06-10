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
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/** Custom Services */
import { ClientKycService } from '../../services/client-kyc.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import {
  KycVerificationDialogComponent,
  KycVerificationDialogData,
  KycVerificationDialogResult
} from '../kyc-verification-dialog/kyc-verification-dialog.component';

/**
 * KYC Management Component
 *
 * Comprehensive KYC management interface providing:
 * - KYC details form for editing document numbers
 * - Individual document verification status display
 * - API verification, manual verification, and unverification actions
 * - Complete verification workflow management
 *
 * Following Angular Architecture KB patterns:
 * - Smart component with reactive forms
 * - Service layer abstraction for data operations
 * - Error handling and user feedback
 * - Material Design compliance
 */
@Component({
  selector: 'mifosx-view-kyc-action',
  templateUrl: './view-kyc-action.component.html',
  styleUrls: ['./view-kyc-action.component.scss']
})
export class ViewKycActionComponent implements OnInit, OnDestroy {
  /** Client and KYC data */
  clientId: number;
  clientData: any;
  kycData: any = {};

  /** Reactive Forms */
  kycDetailsForm: FormGroup;
  verificationNotesForm: FormGroup;

  /** Component state */
  isLoading = false;
  isEditMode = false;
  hasExistingKyc = false;
  isVerificationInProgress = false;

  /** Feature flags */
  isApiVerificationEnabled = false; // Temporarily disabled - coming soon

  /** Available verification methods */
  verificationMethods = [
    { value: 'MANUAL', label: 'Manual Verification' },
    { value: 'API', label: 'API Verification' }
  ];

  /** Document types for verification */
  documentTypes = [
    { key: 'panNumber', label: 'PAN Number', verifiedKey: 'panVerified' },
    { key: 'aadhaarNumber', label: 'Aadhaar Number', verifiedKey: 'aadhaarVerified' },
    { key: 'drivingLicenseNumber', label: 'Driving License', verifiedKey: 'drivingLicenseVerified' },
    { key: 'voterId', label: 'Voter ID', verifiedKey: 'voterIdVerified' },
    { key: 'passportNumber', label: 'Passport Number', verifiedKey: 'passportVerified' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private kycService: ClientKycService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    // Get client ID from parent route parameters (clients/:clientId/kyc)
    this.route.parent?.params.subscribe((params: any) => {
      this.clientId = +params.clientId; // Convert to number
      if (this.clientId) {
        this.loadClientData();
      }
    });

    this.createForms();
  }

  ngOnInit(): void {
    if (this.clientId) {
      this.loadKycData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Creates reactive forms for KYC data entry and verification
   */
  private createForms(): void {
    // KYC Details Form with validation patterns
    this.kycDetailsForm = this.formBuilder.group({
      panNumber: [
        '',
        [Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)]
      ],
      aadhaarNumber: [
        '',
        [Validators.pattern(/^[0-9]{12}$/)]
      ],
      drivingLicenseNumber: [
        '',
        [Validators.maxLength(20)]
      ],
      voterId: [
        '',
        [Validators.maxLength(20)]
      ],
      passportNumber: [
        '',
        [Validators.maxLength(20)]
      ],
      verificationNotes: ['']
    });

    // Verification Notes Form
    this.verificationNotesForm = this.formBuilder.group({
      notes: [
        '',
        [
          Validators.required,
          Validators.maxLength(1000)]
      ],
      reason: [''] // For unverification
    });
  }

  /**
   * Loads KYC data for the client
   */
  private loadKycData(): void {
    if (!this.clientId) {
      return;
    }

    this.isLoading = true;
    this.kycService.getKycDetails(this.clientId).subscribe({
      next: (response) => {
        // Check if response contains actual KYC document data, not just basic client info
        const hasActualKycData =
          response &&
          (response.panNumber ||
            response.aadhaarNumber ||
            response.drivingLicenseNumber ||
            response.voterIdNumber ||
            response.passportNumber);

        if (hasActualKycData) {
          this.kycData = response;
          this.hasExistingKyc = true;
          this.isEditMode = false;
        } else {
          // No actual KYC document data - show "No KYC Details Found" card with "Add KYC Details" button
          this.hasExistingKyc = false;
          this.isEditMode = false; // Show no-data card instead of edit form
          this.initializeEmptyKycData();
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 404) {
          // No KYC data found - show "No KYC Details Found" card with "Add KYC Details" button
          this.hasExistingKyc = false;
          this.isEditMode = false; // Show no-data card instead of edit form
          this.initializeEmptyKycData();
        } else {
          // Handle other errors appropriately - show no-data card for any error
          this.hasExistingKyc = false;
          this.isEditMode = false; // Show no-data card instead of edit form
          this.initializeEmptyKycData();
        }
      }
    });
  }

  /**
   * Populates form with existing KYC data
   */
  private populateForm(): void {
    if (this.kycData) {
      this.kycDetailsForm.patchValue({
        panNumber: this.kycData.panNumber || '',
        aadhaarNumber: this.kycData.aadhaarNumber || '',
        drivingLicenseNumber: this.kycData.drivingLicenseNumber || '',
        voterId: this.kycData.voterIdNumber || '',
        passportNumber: this.kycData.passportNumber || '',
        verificationNotes: this.kycData.manualVerificationNotes || this.kycData.verificationNotes || ''
      });
    }
  }

  /**
   * Toggles edit mode for KYC details
   */
  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;

    // Populate form with existing data when entering edit mode
    if (this.isEditMode && this.hasExistingKyc) {
      this.populateForm();
    }
  }

  /**
   * Saves KYC details (create or update)
   */
  saveKycDetails(): void {
    if (!this.kycDetailsForm.valid || !this.clientId) {
      return;
    }

    this.isLoading = true;

    // Get form values and update kycData
    const formValues = this.kycDetailsForm.value;

    // Update kycData with form values
    if (!this.kycData) {
      this.kycData = {};
    }

    this.kycData = {
      ...this.kycData,
      panNumber: formValues.panNumber || null,
      aadhaarNumber: formValues.aadhaarNumber || null,
      drivingLicenseNumber: formValues.drivingLicenseNumber || null,
      voterIdNumber: formValues.voterId || null,
      passportNumber: formValues.passportNumber || null,
      verificationNotes: formValues.verificationNotes || null
    };

    const saveObservable = this.hasExistingKyc
      ? this.kycService.updateKycDetails(this.clientId, this.kycData.id, this.kycData)
      : this.kycService.createKycDetails(this.clientId, this.kycData);

    saveObservable.subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isEditMode = false;
        this.hasExistingKyc = true;

        // Refresh data to get updated information
        this.loadKycData();

        // Show success message
        this.snackBar.open(
          this.hasExistingKyc ? 'KYC details updated successfully' : 'KYC details created successfully',
          'Close',
          { duration: 3000 }
        );
      },
      error: (error) => {
        this.isLoading = false;
        // Show error message to user
        this.snackBar.open('Failed to save KYC details. Please try again.', 'Close', { duration: 5000 });
      }
    });
  }

  /**
   * Initiates API verification for documents
   */
  verifyKycViaApi(): void {
    if (!this.hasExistingKyc) {
      this.snackBar.open('Please save KYC details before verification', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: 'API Verification',
        dialogContext:
          'Are you sure you want to verify KYC documents via API? This will validate documents against external databases.',
        confirmButtonName: 'Verify',
        cancelButtonName: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((response: boolean) => {
      if (response) {
        this.performApiVerification();
      }
    });
  }

  /**
   * Performs API verification
   */
  private performApiVerification(): void {
    this.isVerificationInProgress = true;

    const verificationData = {
      provider: 'DECENTRO', // Default provider
      verifyPan: !!this.kycData.panNumber,
      verifyAadhaar: !!this.kycData.aadhaarNumber,
      notes: 'API verification initiated'
    };

    this.kycService
      .verifyKycViaApi(this.clientId, verificationData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.snackBar.open('API verification completed successfully', 'Close', { duration: 3000 });
          this.isVerificationInProgress = false;
          this.loadKycData(); // Reload to get updated verification status
        },
        error: (error) => {
          this.snackBar.open(
            'API verification failed: ' + error.error?.defaultUserMessage || 'Unknown error',
            'Close',
            { duration: 5000 }
          );
          this.isVerificationInProgress = false;
        }
      });
  }

  /**
   * Initiates manual verification for documents
   */
  verifyKycManually(): void {
    if (!this.hasExistingKyc) {
      this.snackBar.open('Please save KYC details before verification', 'Close', { duration: 3000 });
      return;
    }

    // Prepare dialog data
    const dialogData: KycVerificationDialogData = {
      type: 'verify',
      clientName: this.clientData?.displayName || `Client ${this.clientId}`,
      kycData: this.kycData,
      documentTypes: this.documentTypes
    };

    const dialogRef = this.dialog.open(KycVerificationDialogComponent, {
      data: dialogData,
      width: '600px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe((result: KycVerificationDialogResult) => {
      if (result && result.action === 'verify') {
        this.performManualVerification(result.selectedDocuments, result.notes);
      }
    });
  }

  /**
   * Performs manual verification
   */
  private performManualVerification(selectedDocuments: { [key: string]: boolean }, notes: string): void {
    this.isVerificationInProgress = true;

    const verificationData = {
      ...selectedDocuments,
      notes: notes
    };

    this.kycService
      .verifyKycManually(this.clientId, verificationData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.snackBar.open('Manual verification completed successfully', 'Close', { duration: 3000 });
          this.isVerificationInProgress = false;
          this.loadKycData(); // Reload to get updated verification status
        },
        error: (error) => {
          this.snackBar.open(
            'Manual verification failed: ' + error.error?.defaultUserMessage || 'Unknown error',
            'Close',
            { duration: 5000 }
          );
          this.isVerificationInProgress = false;
        }
      });
  }

  /**
   * Initiates manual unverification for documents
   */
  unverifyKycManually(): void {
    if (!this.hasExistingKyc) {
      this.snackBar.open('No KYC details available for unverification', 'Close', { duration: 3000 });
      return;
    }

    // Prepare dialog data
    const dialogData: KycVerificationDialogData = {
      type: 'unverify',
      clientName: this.clientData?.displayName || `Client ${this.clientId}`,
      kycData: this.kycData,
      documentTypes: this.documentTypes
    };

    const dialogRef = this.dialog.open(KycVerificationDialogComponent, {
      data: dialogData,
      width: '600px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe((result: KycVerificationDialogResult) => {
      if (result && result.action === 'unverify') {
        this.performManualUnverification(result.selectedDocuments, result.reason || '', result.notes);
      }
    });
  }

  /**
   * Performs manual unverification
   */
  private performManualUnverification(
    selectedDocuments: { [key: string]: boolean },
    reason: string,
    notes: string
  ): void {
    this.isVerificationInProgress = true;

    // Note: Backend currently unverifies ALL documents regardless of selection
    // This is a backend implementation limitation that needs to be addressed
    const unverificationData = {
      reason: notes, // Use notes as reason since we consolidated the fields
      notes: notes,
      ...selectedDocuments
    };

    this.kycService
      .unverifyKycManually(this.clientId, unverificationData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.snackBar.open('Manual unverification completed successfully', 'Close', { duration: 3000 });
          this.isVerificationInProgress = false;
          this.loadKycData(); // Reload to get updated verification status
        },
        error: (error) => {
          this.snackBar.open(
            'Manual unverification failed: ' + error.error?.defaultUserMessage || 'Unknown error',
            'Close',
            { duration: 5000 }
          );
          this.isVerificationInProgress = false;
        }
      });
  }

  /**
   * Gets verification status for a document
   */
  getDocumentVerificationStatus(documentType: any): boolean {
    return this.kycData[documentType.verifiedKey] || false;
  }

  /**
   * Checks if KYC is fully verified (PAN and Aadhaar both verified)
   * This uses the same logic as the KYC status badge component for consistency
   */
  isKycVerified(): boolean {
    if (!this.hasExistingKyc || !this.kycData) {
      return false;
    }

    // Check if both PAN and Aadhaar are verified (primary KYC documents)
    const panVerified = this.kycData.panVerified || false;
    const aadhaarVerified = this.kycData.aadhaarVerified || false;

    // KYC is considered verified if both primary documents (PAN and Aadhaar) are verified
    return panVerified && aadhaarVerified;
  }

  /**
   * Gets the document number for a specific document type
   */
  getDocumentNumber(documentType: any): string {
    if (!this.kycData) {
      return '-';
    }

    const fieldMapping: { [key: string]: string } = {
      panNumber: 'panNumber',
      aadhaarNumber: 'aadhaarNumber',
      drivingLicenseNumber: 'drivingLicenseNumber',
      voterId: 'voterIdNumber', // Note: API returns voterIdNumber but form uses voterId
      passportNumber: 'passportNumber'
    };

    const fieldName = fieldMapping[documentType.key] || documentType.key;
    const value = this.kycData[fieldName];

    // Return value or dash if empty/null/undefined
    return value && value.trim() ? value.trim() : '-';
  }

  /**
   * Gets the overall KYC status
   */
  getOverallKycStatus(): string {
    if (!this.hasExistingKyc) return 'pending';

    const verifiedCount = this.getVerifiedDocumentCount();
    const providedCount = this.getProvidedDocumentCount();

    return verifiedCount > 0 && verifiedCount === providedCount ? 'verified' : 'pending';
  }

  /**
   * Gets the count of verified documents
   */
  getVerifiedDocumentCount(): number {
    if (!this.kycData) return 0;

    return (
      (this.kycData.panVerified ? 1 : 0) +
      (this.kycData.aadhaarVerified ? 1 : 0) +
      (this.kycData.drivingLicenseVerified ? 1 : 0) +
      (this.kycData.voterIdVerified ? 1 : 0) +
      (this.kycData.passportVerified ? 1 : 0)
    );
  }

  /**
   * Gets the count of provided documents
   */
  getProvidedDocumentCount(): number {
    if (!this.kycData) return 0;

    return (
      (this.kycData.panNumber ? 1 : 0) +
      (this.kycData.aadhaarNumber ? 1 : 0) +
      (this.kycData.drivingLicenseNumber ? 1 : 0) +
      (this.kycData.voterIdNumber ? 1 : 0) +
      (this.kycData.passportNumber ? 1 : 0)
    );
  }

  /**
   * Checks if form field has error
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.kycDetailsForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Gets field error message
   */
  getFieldErrorMessage(fieldName: string): string {
    const field = this.kycDetailsForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['pattern']) {
        switch (fieldName) {
          case 'panNumber':
            return 'PAN should be in format: ABCDE1234F';
          case 'aadhaarNumber':
            return 'Aadhaar should be 12 digits';
          default:
            return 'Invalid format';
        }
      }
      if (field.errors['maxlength']) {
        return `Maximum length exceeded`;
      }
    }
    return '';
  }

  /**
   * Cancels current action and navigates back to client
   */
  cancel(): void {
    this.router.navigate([
      '/clients',
      this.clientId
    ]);
  }

  /**
   * Load client data for display
   */
  private loadClientData(): void {
    // For now, set minimal client data - in real implementation,
    // you might fetch from a client service
    this.clientData = {
      id: this.clientId,
      displayName: `Client ${this.clientId}`,
      accountNo: `000000${this.clientId.toString().padStart(3, '0')}`
    };
  }

  private initializeEmptyKycData(): void {
    this.kycData = {
      clientId: this.clientId,
      clientDisplayName: this.clientData?.displayName || `Client ${this.clientId}`,
      panNumber: '',
      aadhaarNumber: '',
      drivingLicenseNumber: '',
      voterId: '',
      passportNumber: '',
      panVerified: false,
      aadhaarVerified: false,
      drivingLicenseVerified: false,
      voterIdVerified: false,
      passportVerified: false,
      manualVerificationNotes: '',
      panVerificationStatus: 'UNVERIFIED',
      aadhaarVerificationStatus: 'UNVERIFIED',
      drivingLicenseVerificationStatus: 'UNVERIFIED',
      voterIdVerificationStatus: 'UNVERIFIED',
      passportVerificationStatus: 'UNVERIFIED',
      panLastVerifiedOn: null,
      aadhaarLastVerifiedOn: null,
      drivingLicenseLastVerifiedOn: null,
      voterIdLastVerifiedOn: null,
      passportLastVerifiedOn: null
    };
  }
}
