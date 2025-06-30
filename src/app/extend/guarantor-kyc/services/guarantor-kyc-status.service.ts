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
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { GuarantorKycService } from './guarantor-kyc.service';

/**
 * Interface for guarantor KYC status information
 * Follows the same pattern as client KYC status
 */
export interface GuarantorKycStatusInfo {
  guarantorKycId: number;
  clientId: number;
  isVerified: boolean;
  isFullyVerified: boolean;
  verifiedDocumentCount: number;
  totalRequiredDocuments: number;
  verificationMethod: 'MANUAL' | 'API' | 'OTP' | null;
  lastVerifiedOn: Date | null;
  verifiedByUsername: string | null;
  panVerified: boolean;
  aadhaarVerified: boolean;
  fullName: string;
  mobileNumber: string;
  relationshipToClient: string;
}

/**
 * Guarantor KYC Status Service
 *
 * Provides status information and caching for guarantor KYC records.
 * Follows the same patterns as ClientKycStatusService for consistency.
 *
 * Key features:
 * - Status caching to reduce API calls
 * - Batch loading for table performance
 * - Real-time status updates
 * - Consistent status determination logic
 */
@Injectable({
  providedIn: 'root'
})
export class GuarantorKycStatusService {
  private statusCache = new Map<number, GuarantorKycStatusInfo>();
  private statusSubject = new BehaviorSubject<Map<number, GuarantorKycStatusInfo>>(new Map());

  // Observable for components to subscribe to status updates
  public statusUpdates$ = this.statusSubject.asObservable();

  constructor(private guarantorKycService: GuarantorKycService) {}

  /**
   * Gets guarantor KYC status with caching
   */
  getGuarantorKycStatus(clientId: number, guarantorKycId: number): Observable<GuarantorKycStatusInfo> {
    // Check cache first
    const cached = this.statusCache.get(guarantorKycId);
    if (cached) {
      return of(cached);
    }

    // Load from service
    return this.guarantorKycService.getGuarantorKyc(clientId, guarantorKycId).pipe(
      map((data) => this.mapToStatusInfo(data)),
      tap((status) => {
        this.statusCache.set(guarantorKycId, status);
        this.notifyStatusUpdate();
      }),
      catchError((error) => {
        console.error('Error loading guarantor KYC status:', error);
        return of(this.createDefaultStatus(clientId, guarantorKycId));
      })
    );
  }

  /**
   * Gets status from cache only (for performance)
   */
  getGuarantorKycStatusFromCache(guarantorKycId: number): GuarantorKycStatusInfo | null {
    return this.statusCache.get(guarantorKycId) || null;
  }

  /**
   * Batch loads guarantor KYC status for multiple records
   * Optimizes table loading performance
   */
  loadGuarantorKycStatusBatch(clientId: number, guarantorKycIds: number[]): Observable<GuarantorKycStatusInfo[]> {
    if (!guarantorKycIds || guarantorKycIds.length === 0) {
      return of([]);
    }

    // Filter out already cached items
    const uncachedIds = guarantorKycIds.filter((id) => !this.statusCache.has(id));

    if (uncachedIds.length === 0) {
      // All items are cached
      return of(guarantorKycIds.map((id) => this.statusCache.get(id)!).filter(Boolean));
    }

    // Load uncached items
    const loadRequests = uncachedIds.map((id) =>
      this.guarantorKycService.getGuarantorKyc(clientId, id).pipe(
        map((data) => this.mapToStatusInfo(data)),
        catchError((error) => {
          console.error(`Error loading guarantor KYC status for ID ${id}:`, error);
          return of(this.createDefaultStatus(clientId, id));
        })
      )
    );

    return forkJoin(loadRequests).pipe(
      tap((statuses) => {
        // Cache all loaded statuses
        statuses.forEach((status) => {
          this.statusCache.set(status.guarantorKycId, status);
        });
        this.notifyStatusUpdate();
      }),
      map(() => {
        // Return all requested statuses (cached + newly loaded)
        return guarantorKycIds.map((id) => this.statusCache.get(id)!).filter(Boolean);
      })
    );
  }

  /**
   * Updates status in cache after verification operations
   */
  updateGuarantorKycStatus(guarantorKycId: number, updates: Partial<GuarantorKycStatusInfo>): void {
    const existing = this.statusCache.get(guarantorKycId);
    if (existing) {
      const updated = { ...existing, ...updates };
      this.statusCache.set(guarantorKycId, updated);
      this.notifyStatusUpdate();
    }
  }

  /**
   * Clears status cache for a specific guarantor KYC record
   */
  clearGuarantorKycStatusCache(guarantorKycId: number): void {
    this.statusCache.delete(guarantorKycId);
    this.notifyStatusUpdate();
  }

  /**
   * Clears all cached status data
   */
  clearAllStatusCache(): void {
    this.statusCache.clear();
    this.notifyStatusUpdate();
  }

  /**
   * Maps guarantor KYC data to status info
   */
  private mapToStatusInfo(data: any): GuarantorKycStatusInfo {
    const panVerified = Boolean(data.panVerified);
    // Aadhaar is considered verified if ANY of the three verification types are true:
    // - API verification (aadhaarVerified)
    // - Manual verification (aadhaarManuallyVerified)
    // - OTP verification (aadhaarOtpVerified)
    const aadhaarVerified =
      Boolean(data.aadhaarVerified) || Boolean(data.aadhaarManuallyVerified) || Boolean(data.aadhaarOtpVerified);
    const verifiedCount = (panVerified ? 1 : 0) + (aadhaarVerified ? 1 : 0);
    const totalRequired = 2; // PAN and Aadhaar

    return {
      guarantorKycId: data.id,
      clientId: data.clientId,
      isVerified: panVerified && aadhaarVerified, // Following client KYC pattern: both required for verification
      isFullyVerified: panVerified && aadhaarVerified,
      verifiedDocumentCount: verifiedCount,
      totalRequiredDocuments: totalRequired,
      verificationMethod: data.verificationMethod || null,
      lastVerifiedOn: data.lastVerifiedOn ? new Date(data.lastVerifiedOn) : null,
      verifiedByUsername: data.verifiedByUsername || null,
      panVerified,
      aadhaarVerified,
      fullName: data.fullName || '',
      mobileNumber: data.mobileNumber || '',
      relationshipToClient: data.relationshipToClient || ''
    };
  }

  /**
   * Creates default status info for error cases
   */
  private createDefaultStatus(clientId: number, guarantorKycId: number): GuarantorKycStatusInfo {
    return {
      guarantorKycId,
      clientId,
      isVerified: false,
      isFullyVerified: false,
      verifiedDocumentCount: 0,
      totalRequiredDocuments: 2,
      verificationMethod: null,
      lastVerifiedOn: null,
      verifiedByUsername: null,
      panVerified: false,
      aadhaarVerified: false,
      fullName: '',
      mobileNumber: '',
      relationshipToClient: ''
    };
  }

  /**
   * Notifies subscribers of status updates
   */
  private notifyStatusUpdate(): void {
    this.statusSubject.next(new Map(this.statusCache));
  }

  /**
   * Determines badge class based on verification status
   * Follows the same logic as client KYC badge
   */
  getBadgeClass(status: GuarantorKycStatusInfo): string {
    if (status.isFullyVerified) {
      return 'kyc-verified';
    } else if (status.verifiedDocumentCount > 0) {
      return 'kyc-partial'; // Partially verified (some documents verified but not all)
    } else {
      return 'kyc-pending'; // Not verified yet
    }
  }

  /**
   * Gets badge text based on verification status
   */
  getBadgeText(status: GuarantorKycStatusInfo, showDetails: boolean = false): string {
    if (status.isFullyVerified) {
      return showDetails ? `KYC Verified (${status.verifiedDocumentCount} docs)` : 'KYC Verified';
    } else if (status.verifiedDocumentCount > 0) {
      return showDetails
        ? `KYC Partial (${status.verifiedDocumentCount}/${status.totalRequiredDocuments})`
        : 'KYC Partial';
    } else {
      return showDetails ? `KYC Pending (0/${status.totalRequiredDocuments})` : 'KYC Pending';
    }
  }

  /**
   * Gets badge icon based on verification status
   */
  getBadgeIcon(status: GuarantorKycStatusInfo): string {
    if (status.isFullyVerified) {
      return 'verified_user';
    } else if (status.isVerified) {
      return 'schedule';
    } else {
      return 'schedule';
    }
  }

  /**
   * Gets tooltip text for badge
   */
  getTooltipText(status: GuarantorKycStatusInfo): string {
    if (status.isFullyVerified) {
      const dateText = status.lastVerifiedOn
        ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(status.lastVerifiedOn)
        : 'recently';
      return `KYC verified with PAN and Aadhaar documents. Last verified: ${dateText}`;
    } else if (status.isVerified) {
      const docs = [];
      if (status.panVerified) docs.push('PAN');
      if (status.aadhaarVerified) docs.push('Aadhaar');
      return `Partially verified: ${docs.join(', ')}. Complete verification required.`;
    } else {
      return 'KYC verification pending. PAN and Aadhaar documents required for full verification.';
    }
  }
}
