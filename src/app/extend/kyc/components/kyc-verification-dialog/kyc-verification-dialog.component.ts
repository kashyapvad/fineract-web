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
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/** Dialog Data Interface */
export interface KycVerificationDialogData {
  type: 'verify' | 'unverify';
  clientName: string;
  kycData: any;
  documentTypes: any[];
}

/** Dialog Result Interface */
export interface KycVerificationDialogResult {
  action: 'verify' | 'unverify' | 'cancel';
  selectedDocuments: { [key: string]: boolean };
  notes: string;
  reason?: string; // For unverification
}

/**
 * KYC Verification Dialog Component
 *
 * Provides a dialog interface for selecting which KYC documents to verify or unverify.
 * Follows Angular Architecture KB patterns:
 * - Smart component with reactive forms
 * - Proper Material Dialog implementation
 * - Clear interface definitions for type safety
 *
 * Following UI Components KB patterns:
 * - Material Design dialog structure
 * - Consistent form validation
 * - Accessibility compliance
 */
@Component({
  selector: 'mifosx-kyc-verification-dialog',
  templateUrl: './kyc-verification-dialog.component.html',
  styleUrls: ['./kyc-verification-dialog.component.scss']
})
export class KycVerificationDialogComponent implements OnInit {
  verificationForm: FormGroup;
  isVerificationMode: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<KycVerificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: KycVerificationDialogData
  ) {
    this.isVerificationMode = data.type === 'verify';
    this.createForm();
  }

  ngOnInit(): void {
    this.initializeFormValues();
  }

  /**
   * Creates the reactive form for document selection and notes
   */
  private createForm(): void {
    const formConfig: any = {
      notes: [
        '',
        this.isVerificationMode ? [] : [
              Validators.required,
              Validators.maxLength(1000)]
      ]
    };

    // No separate reason field for unverification - use consolidated notes field
    // This aligns with the backend database which only has one verification_notes field

    // Add document selection checkboxes
    this.data.documentTypes.forEach((docType) => {
      if (this.getDocumentValue(docType)) {
        // Only show checkboxes for documents that have values
        formConfig[docType.key] = [false];
      }
    });

    this.verificationForm = this.formBuilder.group(formConfig);
  }

  /**
   * Initializes form values with all documents deselected by default
   */
  private initializeFormValues(): void {
    // All documents are deselected by default (no auto-selection)
    // Users must manually select documents they want to verify/unverify

    // Pre-populate notes field with existing verification notes for both verify and unverify modes
    let existingNotes = this.data.kycData.manualVerificationNotes || this.data.kycData.verificationNotes || '';

    if (existingNotes) {
      if (this.isVerificationMode && existingNotes.startsWith('UNVERIFIED:')) {
        // For verify mode, remove the UNVERIFIED prefix to show clean notes
        existingNotes = existingNotes.replace('UNVERIFIED: ', '').trim();
      }
      this.verificationForm.get('notes')?.setValue(existingNotes);
    }
  }

  /**
   * Gets the document value from KYC data
   */
  getDocumentValue(documentType: any): string {
    const fieldMapping: { [key: string]: string } = {
      panNumber: 'panNumber',
      aadhaarNumber: 'aadhaarNumber',
      drivingLicenseNumber: 'drivingLicenseNumber',
      voterId: 'voterIdNumber', // Note: mapping difference
      passportNumber: 'passportNumber'
    };

    const fieldName = fieldMapping[documentType.key] || documentType.key;
    return this.data.kycData[fieldName] || '';
  }

  /**
   * Checks if a document is currently verified
   */
  isDocumentVerified(documentType: any): boolean {
    return this.data.kycData[documentType.verifiedKey] || false;
  }

  /**
   * Gets available documents (those with values)
   */
  getAvailableDocuments(): any[] {
    return this.data.documentTypes.filter((docType) => this.getDocumentValue(docType));
  }

  /**
   * Gets eligible documents for the current action
   */
  getEligibleDocuments(): any[] {
    return this.getAvailableDocuments().filter((docType) => {
      if (this.isVerificationMode) {
        // Can verify if not already verified
        return !this.isDocumentVerified(docType);
      } else {
        // Can unverify if already verified
        return this.isDocumentVerified(docType);
      }
    });
  }

  /**
   * Checks if any documents are selected
   */
  hasSelectedDocuments(): boolean {
    return this.getAvailableDocuments().some((docType) => this.verificationForm.get(docType.key)?.value === true);
  }

  /**
   * Gets selected documents for the action
   */
  getSelectedDocuments(): { [key: string]: boolean } {
    const selected: { [key: string]: boolean } = {};

    this.data.documentTypes.forEach((docType) => {
      if (this.getDocumentValue(docType)) {
        const isSelected = this.verificationForm.get(docType.key)?.value === true;

        if (this.isVerificationMode) {
          // For verification: only send selected documents to preserve state of unselected ones
          if (isSelected) {
            const fieldMapping: { [key: string]: string } = {
              panNumber: 'panVerified',
              aadhaarNumber: 'aadhaarVerified',
              drivingLicenseNumber: 'drivingLicenseVerified',
              voterId: 'voterIdVerified',
              passportNumber: 'passportVerified'
            };

            const backendKey = fieldMapping[docType.key];
            if (backendKey) {
              selected[backendKey] = true; // Only selected documents are set to true
            }
          }
          // Unselected documents are not included in the payload at all
        } else {
          // For unverification: keep the unverify prefix format
          const unverifyKey = `unverify${this.capitalize(docType.key.replace('Number', ''))}`;
          selected[unverifyKey] = isSelected;
        }
      }
    });

    return selected;
  }

  /**
   * Capitalizes first letter for API field names
   */
  private capitalize(str: string): string {
    if (str === 'voterId') return 'VoterId';
    if (str === 'drivingLicense') return 'DrivingLicense';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Confirms the verification/unverification action
   */
  confirm(): void {
    if (this.verificationForm.invalid || !this.hasSelectedDocuments()) {
      Object.keys(this.verificationForm.controls).forEach((key) => {
        this.verificationForm.get(key)?.markAsTouched();
      });
      return;
    }

    const notes = this.verificationForm.get('notes')?.value || '';

    const result: KycVerificationDialogResult = {
      action: this.data.type,
      selectedDocuments: this.getSelectedDocuments(),
      notes: notes,
      reason: this.isVerificationMode ? undefined : notes // For unverify, use notes as reason for backend compatibility
    };

    this.dialogRef.close(result);
  }

  /**
   * Cancels the dialog
   */
  cancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }

  /**
   * Checks if form field has error
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.verificationForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  /**
   * Gets error message for form field
   */
  getFieldErrorMessage(fieldName: string): string {
    const field = this.verificationForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field.errors['maxlength']) {
      return `Maximum ${field.errors['maxlength'].requiredLength} characters allowed`;
    }
    return 'Invalid input';
  }
}
