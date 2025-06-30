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

import { Injectable } from '@angular/core';
import {
  KycVerificationDialogData,
  KycVerificationDialogResult
} from '../../kyc/components/kyc-verification-dialog/kyc-verification-dialog.component';

/**
 * Guarantor KYC Dialog Adapter Service
 *
 * Provides data transformation between guarantor KYC data structure and
 * the KYC verification dialog component's expected interface.
 *
 * This service follows the Adapter pattern to enable reuse of the existing
 * KYC verification dialog for guarantor KYC operations without duplicating code.
 */
@Injectable({
  providedIn: 'root'
})
export class GuarantorKycDialogAdapterService {
  /**
   * Document types supported for guarantor KYC verification
   * Maps guarantor KYC fields to dialog-compatible format
   */
  private readonly guarantorDocumentTypes = [
    {
      key: 'panNumber',
      label: 'PAN Number',
      verifiedKey: 'panVerified',
      icon: 'credit_card'
    },
    {
      key: 'aadhaarNumber',
      label: 'Aadhaar Number',
      verifiedKey: 'aadhaarVerified',
      icon: 'fingerprint'
    }
  ];

  /**
   * Adapts guarantor KYC data to KYC dialog format for verification operations
   */
  adaptGuarantorDataForDialog(
    guarantorKyc: any,
    clientId: number,
    clientName: string,
    verificationType: 'verify' | 'unverify' | 'api-verify' | 'otp-verify'
  ): KycVerificationDialogData {
    return {
      type: verificationType,
      clientName: `${clientName} - Guarantor: ${guarantorKyc.fullName}`,
      kycData: this.mapGuarantorToKycData(guarantorKyc),
      documentTypes: this.guarantorDocumentTypes
    };
  }

  /**
   * Maps guarantor KYC data structure to match KYC dialog expectations
   */
  private mapGuarantorToKycData(guarantorKyc: any): any {
    return {
      // Document numbers
      panNumber: guarantorKyc.panNumber,
      aadhaarNumber: guarantorKyc.aadhaarNumber,

      // Primary verification status (API verification)
      panVerified: guarantorKyc.panVerified || false,
      aadhaarVerified: guarantorKyc.aadhaarVerified || false,

      // Manual verification status (for guarantor KYC)
      panManuallyVerified: guarantorKyc.panManuallyVerified || false,
      aadhaarManuallyVerified: guarantorKyc.aadhaarManuallyVerified || false,

      // OTP verification status
      aadhaarOtpVerified: guarantorKyc.aadhaarOtpVerified || false,

      // Metadata
      verificationNotes: guarantorKyc.verificationNotes,
      lastVerifiedOn: guarantorKyc.lastVerifiedOn,
      lastVerifiedByUsername: guarantorKyc.lastVerifiedByUsername,

      // Additional guarantor context
      fullName: guarantorKyc.fullName,
      mobileNumber: guarantorKyc.mobileNumber,
      relationshipToClient: guarantorKyc.relationshipToClient
    };
  }

  /**
   * Maps KYC dialog result back to guarantor service call format
   */
  adaptDialogResultForGuarantorService(result: KycVerificationDialogResult, guarantorKycId: number): any {
    const serviceData: any = {
      notes: result.notes
    };

    // Map selected documents based on action type - following client KYC pattern
    if (result.selectedDocuments) {
      if (result.action === 'verify' || result.action === 'api-verify' || result.action === 'otp-verify') {
        // For verification: only include selected documents with true value
        if (result.selectedDocuments['panVerified']) {
          serviceData.panVerified = true;
        }
        if (result.selectedDocuments['aadhaarVerified']) {
          serviceData.aadhaarVerified = true;
        }
      } else if (result.action === 'unverify') {
        // For unverification: map to unverify parameters following client KYC pattern
        if (result.selectedDocuments['unverifyPan']) {
          serviceData.unverifyPan = true;
        }
        if (result.selectedDocuments['unverifyAadhaar']) {
          serviceData.unverifyAadhaar = true;
        }
      }
    }

    // Add reason for unverification
    if (result.action === 'unverify' && result.reason) {
      serviceData.reason = result.reason;
    }

    return serviceData;
  }

  /**
   * Gets available document types for guarantor KYC
   */
  getGuarantorDocumentTypes(): any[] {
    return [...this.guarantorDocumentTypes];
  }

  /**
   * Checks if a specific verification type is supported for guarantors
   */
  isVerificationTypeSupported(type: string): boolean {
    const supportedTypes = [
      'verify',
      'unverify',
      'api-verify',
      'otp-verify'
    ];
    return supportedTypes.includes(type);
  }

  /**
   * Gets appropriate dialog title based on verification type and guarantor name
   */
  getDialogTitle(verificationType: string, guarantorName: string): string {
    const typeLabels: { [key: string]: string } = {
      verify: 'Manual Verification',
      unverify: 'Manual Unverification',
      'api-verify': 'API Verification',
      'otp-verify': 'OTP Verification'
    };

    const actionLabel = typeLabels[verificationType] || 'Verification';
    return `${actionLabel} - ${guarantorName}`;
  }

  /**
   * Validates that guarantor data has required fields for verification
   */
  validateGuarantorDataForVerification(guarantorKyc: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!guarantorKyc) {
      errors.push('Guarantor KYC data is required');
      return { valid: false, errors };
    }

    if (!guarantorKyc.fullName) {
      errors.push('Guarantor name is required');
    }

    // Check if at least one document is available
    const hasAnyDocument = guarantorKyc.panNumber || guarantorKyc.aadhaarNumber;
    if (!hasAnyDocument) {
      errors.push('At least one document (PAN or Aadhaar) must be provided for verification');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
