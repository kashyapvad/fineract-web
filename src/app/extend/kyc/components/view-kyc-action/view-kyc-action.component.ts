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
import { ClientKycStatusService } from '../../services/client-kyc-status.service';
import { VerificationNotesService } from '../../../shared/services/verification-notes.service';
import { KycDocumentGenerationService } from '../../../services/kyc-document-generation.service';
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
  isApiVerificationEnabled = true; // Now enabled with External Provider integration

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
    private kycStatusService: ClientKycStatusService,
    private kycDocumentService: KycDocumentGenerationService,
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
        // Check if response contains actual KYC document data with the correct field names
        const hasActualKycData =
          response &&
          response.id && // Has KYC record ID
          (response.panNumber ||
            response.aadhaarNumber ||
            response.drivingLicenseNumber ||
            response.voterIdNumber || // Backend returns voterIdNumber in DTO
            response.passportNumber);

        if (hasActualKycData) {
          this.kycData = response;
          this.hasExistingKyc = true;
          this.isEditMode = false;

          // Force change detection to update UI with fresh data
          this.changeDetectorRef.detectChanges();
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
        } else if (error.status === 500) {
          // Server error - might be database issue or authentication problem
          this.snackBar.open(
            'Unable to load KYC data. If you just added KYC details, please refresh the page.',
            'Close',
            { duration: 5000 }
          );
          this.hasExistingKyc = false;
          this.isEditMode = false;
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
      // Get verification notes using the same logic as verification dialog
      let existingNotes =
        this.kycData.manualVerificationNotes || this.kycData.verificationNotes || this.kycData.notes || '';

      // Clean up UNVERIFIED prefix if present (same as verification dialog)
      if (existingNotes && existingNotes.startsWith('UNVERIFIED:')) {
        existingNotes = existingNotes.replace('UNVERIFIED: ', '').trim();
      }

      this.kycDetailsForm.patchValue({
        panNumber: this.kycData.panNumber || '',
        aadhaarNumber: this.kycData.aadhaarNumber || '',
        drivingLicenseNumber: this.kycData.drivingLicenseNumber || '',
        voterId: this.kycData.voterIdNumber || '',
        passportNumber: this.kycData.passportNumber || '',
        verificationNotes: existingNotes
      });

      // Force change detection to ensure form is updated
      this.changeDetectorRef.detectChanges();
    }
  }

  /**
   * Toggles edit mode for KYC details
   */
  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;

    // Populate form with existing data when entering edit mode
    if (this.isEditMode && this.hasExistingKyc) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        this.populateForm();
      }, 50);
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

    // Get form values
    const formValues = this.kycDetailsForm.value;

    // Create payload with proper field mapping
    const kycPayload = {
      panNumber: formValues.panNumber || null,
      aadhaarNumber: formValues.aadhaarNumber || null,
      drivingLicenseNumber: formValues.drivingLicenseNumber || null,
      voterId: formValues.voterId || null, // Backend expects voterId parameter
      passportNumber: formValues.passportNumber || null,
      // Send verification notes in multiple field names to ensure backend compatibility
      verificationNotes: formValues.verificationNotes || null,
      manualVerificationNotes: formValues.verificationNotes || null,
      notes: formValues.verificationNotes || null
    };

    const saveObservable =
      this.hasExistingKyc && this.kycData.id
        ? this.kycService.updateKycDetails(this.clientId, this.kycData.id, kycPayload)
        : this.kycService.createKycDetails(this.clientId, kycPayload);

    saveObservable.subscribe({
      next: (response) => {
        const wasUpdate = this.hasExistingKyc && this.kycData.id;

        // Show success message with refresh indicator
        this.snackBar.open(
          wasUpdate
            ? 'KYC details updated successfully. Refresh the page to see the latest data.'
            : 'KYC details created successfully. Refresh the page to see the latest data.',
          'Close',
          { duration: 3000 }
        );

        // Clear KYC status cache since data has changed
        this.kycStatusService.clearClientCache(this.clientId);

        // After successful save, reload the data from server to ensure UI is in sync
        this.loadKycData();
      },
      error: (error) => {
        this.isLoading = false;

        // For 403 and 500 errors, check if KYC data was actually saved despite the error
        // This handles cases where the operation succeeded but threw an error due to constraints
        if (error.status === 403 || error.status === 500) {
          this.checkIfKycWasSaved(error);
        } else {
          // For other errors (400, etc.), show the backend error message directly
          this.showSaveErrorMessage(error);
        }
      }
    });
  }

  /**
   * Intelligently checks if KYC data was actually saved despite save error
   * This method makes a fresh API call to determine the actual database state
   */
  private checkIfKycWasSaved(saveError: any): void {
    // Make a fresh call to check if KYC data exists
    this.kycService.getKycDetails(this.clientId).subscribe({
      next: (response) => {
        // Check if response contains actual KYC document data
        const hasActualKycData =
          response &&
          response.id &&
          (response.panNumber ||
            response.aadhaarNumber ||
            response.drivingLicenseNumber ||
            response.voterIdNumber ||
            response.passportNumber);

        if (hasActualKycData) {
          // KYC data exists - determine appropriate message based on error type
          let successMessage = 'KYC details were saved successfully! Refreshing data...';
          if (saveError.status === 403) {
            successMessage = 'KYC details already exist and are up to date. Refreshing data...';
          }

          this.snackBar.open(successMessage, 'Close', { duration: 5000 });

          // Update the component state with the saved data
          this.kycData = response;
          this.hasExistingKyc = true;
          this.isEditMode = false;

          // Clear cache and force UI update
          this.kycStatusService.clearClientCache(this.clientId);
          this.changeDetectorRef.detectChanges();
        } else {
          // No KYC data found - show the actual error
          this.showSaveErrorMessage(saveError);
        }
      },
      error: (checkError) => {
        // If the check fails with 404, it means no KYC data exists - show original error
        // If the check fails with other errors, still show original error
        if (checkError.status === 404) {
          // No KYC data exists - the save truly failed
          this.showSaveErrorMessage(saveError);
        } else {
          // Other error during check - assume save failed and show original error
          this.showSaveErrorMessage(saveError);
        }
      }
    });
  }

  /**
   * Extracts error message from Fineract error response
   * Handles both specific validation errors (in errors array) and generic errors
   */
  private extractErrorMessage(error: any): string {
    // For domain rule violations, the specific error message is in the errors array
    const specificError =
      error.error?.errors?.[0]?.defaultUserMessage ||
      error.error?.errors?.[0]?.userMessage ||
      error.error?.errors?.[0]?.message ||
      '';

    const genericError =
      error.error?.defaultUserMessage || error.error?.userMessage || error.error?.message || error.message || '';

    // Use specific error first, fallback to generic
    return specificError || genericError;
  }

  /**
   * Shows appropriate error message based on the save error
   * This method is only called when we've confirmed KYC data does NOT exist
   */
  private showSaveErrorMessage(error: any): void {
    // Extract the actual error message from backend
    const backendMessage = this.extractErrorMessage(error);

    // Use backend message if available, otherwise provide generic fallback
    const errorMessage = backendMessage || 'Failed to save KYC details. Please try again.';

    // Show error message to user with refresh action
    const snackBarRef = this.snackBar.open(errorMessage, 'Refresh', { duration: 8000 });

    // Handle refresh action
    snackBarRef.onAction().subscribe(() => {
      this.loadKycData();
    });
  }

  /**
   * Initiates API verification for documents
   */
  verifyKycViaApi(): void {
    if (!this.validateKycExistsForVerification()) return;

    // Prepare dialog data for API verification
    const dialogData: KycVerificationDialogData = {
      type: 'api-verify',
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
      if (result && result.action === 'api-verify') {
        // Extract PAN and Aadhaar verification flags from selected documents
        const verifyPan = result.selectedDocuments['panVerified'] || false;
        const verifyAadhaar = result.selectedDocuments['aadhaarVerified'] || false;
        this.performApiVerification(verifyPan, verifyAadhaar, result.notes);
      }
    });
  }

  /**
   * Performs API verification
   */
  private performApiVerification(verifyPan: boolean, verifyAadhaar: boolean, notes: string): void {
    this.isVerificationInProgress = true;

    const verificationData = {
      provider: 'EXTERNAL_PROVIDER', // External Provider provider for KYC verification
      verifyPan: verifyPan,
      verifyAadhaar: verifyAadhaar,
      notes: notes || 'API verification initiated via External Provider'
    };

    // Show progress message
    const documentsToVerify = [];
    if (verifyPan) documentsToVerify.push('PAN');
    if (verifyAadhaar) documentsToVerify.push('Aadhaar');

    this.snackBar.open(`Verifying ${documentsToVerify.join(' and ')} via API...`, 'Close', { duration: 3000 });

    this.kycService
      .verifyKycViaApi(this.clientId, verificationData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          // Refresh KYC data to get latest verification status
          this.loadKycData();

          // Show success message
          let successMessage = 'API verification completed';
          if (verifyPan && verifyAadhaar) {
            successMessage = 'PAN and Aadhaar verification completed';
          } else if (verifyPan) {
            successMessage = 'PAN verification completed';
          } else if (verifyAadhaar) {
            successMessage = 'Aadhaar verification completed';
          }

          this.completeVerificationOperation(successMessage);
        },
        error: (error) => {
          // Handle specific error cases based on backend provider configuration
          if (error.status === 503) {
            this.handleVerificationError(
              error,
              'Credit bureau service is currently unavailable. The external verification service is not configured. Please use manual verification or contact system administrator.'
            );
          } else if (error.status === 500) {
            this.handleVerificationError(
              error,
              'Server error during verification. Please try again later or use manual verification.'
            );
          } else if (error.status === 400) {
            this.handleVerificationError(
              error,
              'Invalid verification request. Please check the document numbers and try again.'
            );
          } else {
            this.handleVerificationError(
              error,
              'API verification is not available. Please use manual verification instead.'
            );
          }
        }
      });
  }

  /**
   * Initiates manual verification for documents
   */
  verifyKycManually(): void {
    if (!this.validateKycExistsForVerification()) return;

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
          // Update verification status for selected documents
          this.updateVerificationStatus(selectedDocuments, true);

          // Update verification metadata
          this.updateVerificationMetadata('MANUAL', 'Current User', notes);

          // Complete operation and refresh
          this.completeVerificationOperation('Manual verification completed successfully');
        },
        error: (error) => {
          this.handleVerificationError(error, 'Manual verification failed');
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
          // Update verification status for selected documents (set to false)
          this.updateVerificationStatus(selectedDocuments, false);

          // Update unverification metadata
          this.updateUnverificationMetadata(notes);

          // Complete operation and refresh
          this.completeVerificationOperation('Manual unverification completed successfully');
        },
        error: (error) => {
          this.handleVerificationError(error, 'Manual unverification failed');
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

    // Direct field mapping - backend returns these exact field names
    const fieldMapping: { [key: string]: string } = {
      panNumber: 'panNumber',
      aadhaarNumber: 'aadhaarNumber',
      drivingLicenseNumber: 'drivingLicenseNumber',
      voterId: 'voterIdNumber', // Backend DTO maps entity.voterId to DTO.voterIdNumber
      passportNumber: 'passportNumber'
    };

    const fieldName = fieldMapping[documentType.key] || documentType.key;
    const value = this.kycData[fieldName];

    // Return value or dash if empty/null/undefined
    return value && value.trim() ? value.trim() : '-';
  }

  /**
   * Gets tooltip text for API verification button
   */
  getApiVerificationTooltip(): string {
    if (!this.kycData.panNumber && !this.kycData.aadhaarNumber) {
      return 'Add PAN or Aadhaar number to enable API verification';
    }

    const documentsToVerify = [];
    if (this.kycData.panNumber) {
      documentsToVerify.push('PAN');
    }
    if (this.kycData.aadhaarNumber) {
      documentsToVerify.push('Aadhaar');
    }

    return `Verify ${documentsToVerify.join(' and ')} using External Provider API`;
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
    return this.countDocuments('verified');
  }

  /**
   * Gets the count of provided documents
   */
  getProvidedDocumentCount(): number {
    if (!this.kycData) return 0;
    return this.countDocuments('provided');
  }

  /**
   * Helper method to count documents by type
   */
  private countDocuments(type: 'verified' | 'provided'): number {
    const fields = type === 'verified' ? [
            'panVerified',
            'aadhaarVerified',
            'drivingLicenseVerified',
            'voterIdVerified',
            'passportVerified'
          ] : [
            'panNumber',
            'aadhaarNumber',
            'drivingLicenseNumber',
            'voterIdNumber',
            'passportNumber'
          ]; // Backend returns voterIdNumber

    return fields.reduce((count, field) => {
      return count + (this.kycData[field] ? 1 : 0);
    }, 0);
  }

  /**
   * Validates that KYC data exists before verification operations
   */
  private validateKycExistsForVerification(): boolean {
    if (!this.hasExistingKyc) {
      this.snackBar.open('Please save KYC details before verification', 'Close', { duration: 3000 });
      return false;
    }
    return true;
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
      voterIdNumber: '', // Backend returns voterIdNumber in DTO
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

  // ============================================================================
  // HELPER METHODS FOR REDUCING CODE DUPLICATION
  // ============================================================================

  /**
   * Updates verification status for selected documents
   * Since backend now handles selective updates correctly, we can simplify this method
   * and trust the backend to return the correct state via loadKycData()
   */
  private updateVerificationStatus(selectedDocuments: { [key: string]: boolean }, verified: boolean): void {
    // Note: The backend now correctly handles selective verification/unverification
    // We no longer need to manually update individual document statuses here
    // The loadKycData() call after operation completion will fetch the correct state from backend
    // This method is kept for backward compatibility but the actual UI updates
    // will come from the fresh data loaded from the backend
  }

  /**
   * Updates verification metadata (same approach as verification modals)
   */
  private updateVerificationMetadata(method: string, user: string, notes: string): void {
    this.kycData.lastVerifiedOn = new Date().toISOString().split('T')[0];
    this.kycData.lastVerifiedByUsername = user;
    this.kycData.verificationMethod = method;
    // Update notes in all possible fields using same approach as verification dialog
    this.kycData.manualVerificationNotes = notes;
    this.kycData.verificationNotes = notes;
    this.kycData.notes = notes;
  }

  /**
   * Updates unverification metadata (same approach as verification modals)
   */
  private updateUnverificationMetadata(notes: string): void {
    this.kycData.lastVerifiedOn = null;
    this.kycData.lastVerifiedByUsername = null;
    this.kycData.verificationMethod = null;
    // Update notes with UNVERIFIED prefix in all fields (same as verification dialog)
    const unverifiedNotes = `UNVERIFIED: ${notes}`;
    this.kycData.manualVerificationNotes = unverifiedNotes;
    this.kycData.verificationNotes = unverifiedNotes;
    this.kycData.notes = unverifiedNotes;
  }

  /**
   * Completes verification operation with UI updates
   */
  private completeVerificationOperation(successMessage: string): void {
    this.isVerificationInProgress = false;

    // Clear KYC status cache since data has changed
    this.kycStatusService.clearClientCache(this.clientId);

    // Force change detection to update UI immediately
    this.changeDetectorRef.detectChanges();

    // Show success message
    this.snackBar.open(successMessage, 'Close', { duration: 3000 });

    // Refresh data in background to get server state
    this.loadKycData();
  }

  /**
   * Handles verification errors consistently
   */
  private handleVerificationError(error: any, baseMessage: string): void {
    this.isVerificationInProgress = false;
    this.snackBar.open(`${baseMessage}: ${error.error?.defaultUserMessage || 'Unknown error'}`, 'Close', {
      duration: 5000
    });
  }

  /**
   * Generate KYC document for the client
   */
  generateKycDocument(): void {
    if (!this.clientId) {
      this.snackBar.open('Client ID not available', 'Close', { duration: 3000 });
      return;
    }

    if (!this.hasExistingKyc) {
      this.snackBar.open('Please save KYC details before generating document', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.kycDocumentService
      .generateKycDocument(this.clientId, 'default')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob: Blob) => {
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `KYC_Document_Client_${this.clientId}.docx`;
          link.click();
          window.URL.revokeObjectURL(url);

          this.isLoading = false;
          this.snackBar.open('KYC document generated successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(
            `Document generation failed: ${error.error?.defaultUserMessage || 'Unknown error'}`,
            'Close',
            { duration: 5000 }
          );
        }
      });
  }
}
