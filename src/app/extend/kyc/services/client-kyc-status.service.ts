import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ClientKycService } from './client-kyc.service';

export interface KycStatusInfo {
  isVerified: boolean;
  verifiedDocumentCount: number;
  totalRequiredDocuments: number;
  hasRequiredDocuments: boolean; // PAN and Aadhaar both verified
  lastVerifiedOn?: Date; // Keep as raw data for dateFormat pipe
}

@Injectable({
  providedIn: 'root'
})
export class ClientKycStatusService {
  constructor(private kycService: ClientKycService) {}

  /**
   * Get KYC verification status for a client
   */
  getKycStatus(clientId: number): Observable<KycStatusInfo> {
    return this.kycService.getKycDetails(clientId).pipe(
      map((kycData) => this.processKycStatus(kycData)),
      catchError(() => {
        // If no KYC data or error, return unverified status
        return of({
          isVerified: false,
          verifiedDocumentCount: 0,
          totalRequiredDocuments: 2,
          hasRequiredDocuments: false
        });
      })
    );
  }

  /**
   * Check if client has verified KYC (PAN and Aadhaar verified)
   */
  isClientKycVerified(clientId: number): Observable<boolean> {
    return this.getKycStatus(clientId).pipe(map((status) => status.hasRequiredDocuments));
  }

  /**
   * Process KYC data to determine verification status
   */
  private processKycStatus(kycData: any): KycStatusInfo {
    if (!kycData) {
      return {
        isVerified: false,
        verifiedDocumentCount: 0,
        totalRequiredDocuments: 2,
        hasRequiredDocuments: false
      };
    }

    // Count verified documents
    const verifiedCount = this.getVerifiedDocumentCount(kycData);

    // Check if required documents (PAN and Aadhaar) are verified
    const hasRequiredDocuments = Boolean(kycData.panVerified && kycData.aadhaarVerified);

    // Parse last verified date if available
    let lastVerifiedOn: any | undefined;
    if (kycData.lastVerifiedOn) {
      if (Array.isArray(kycData.lastVerifiedOn) && kycData.lastVerifiedOn.length >= 3) {
        const [
          year,
          month,
          day
        ] = kycData.lastVerifiedOn;
        lastVerifiedOn = [
          year,
          month,
          day
        ];
      } else if (kycData.lastVerifiedOn instanceof Date) {
        lastVerifiedOn = kycData.lastVerifiedOn;
      }
    }

    return {
      isVerified: hasRequiredDocuments,
      verifiedDocumentCount: verifiedCount,
      totalRequiredDocuments: 2, // PAN and Aadhaar are required
      hasRequiredDocuments,
      lastVerifiedOn
    };
  }

  /**
   * Count total verified documents
   */
  private getVerifiedDocumentCount(kycData: any): number {
    if (!kycData) return 0;

    return (
      (kycData.panVerified ? 1 : 0) +
      (kycData.aadhaarVerified ? 1 : 0) +
      (kycData.drivingLicenseVerified ? 1 : 0) +
      (kycData.voterIdVerified ? 1 : 0) +
      (kycData.passportVerified ? 1 : 0)
    );
  }
}
