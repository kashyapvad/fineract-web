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
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { map, catchError, tap, switchMap, shareReplay } from 'rxjs/operators';

/** Status Interfaces - Updated to use proper KYC module interfaces */
export interface KycStatusData {
  status: 'fully-verified' | 'partially-verified' | 'not-verified' | 'manually-unverified' | 'error';
  panVerified?: boolean;
  aadhaarVerified?: boolean;
  drivingLicenseVerified?: boolean;
  voterIdVerified?: boolean;
  passportVerified?: boolean;
  verifiedCount?: number;
  totalCount?: number;
  totalDocuments?: number;
  lastVerifiedOn?: Date;
  error?: string;
  [key: string]: any; // Allow any additional properties
}

export interface CreditBureauStatusData {
  status:
    | 'available'
    | 'pending'
    | 'not-available'
    | 'no-report'
    | 'report-available'
    | 'report-pending'
    | 'report-failed'
    | 'error';
  reportDate?: Date;
  creditScore?: number;
  creditRating?: string;
  bureauName?: string;
  reportProvider?: string;
  error?: string;
  [key: string]: any; // Allow any additional properties
}

/** Combined Status Interface */
export interface ClientExtendStatus {
  clientId: number;
  kyc: KycStatusData;
  creditBureau: CreditBureauStatusData;
  lastUpdated: Date;
}

/**
 * Client Status Service
 *
 * Provides status information for KYC and Credit Bureau functionality.
 * Follows State Management KB patterns:
 * - HTTP service abstraction with proper error handling
 * - Data caching strategies with appropriate invalidation
 * - Observable-based reactive programming
 * - Error handling with user-friendly feedback
 */
@Injectable({
  providedIn: 'root'
})
export class ClientStatusService {
  // Cache for status data with 5-minute expiration
  private kycStatusCache = new Map<number, { data: KycStatusData; timestamp: number }>();
  private creditBureauStatusCache = new Map<number, { data: CreditBureauStatusData; timestamp: number }>();

  // Cache expiration time (5 minutes)
  private readonly CACHE_EXPIRATION_MS = 5 * 60 * 1000;

  // Status update subjects for reactive patterns
  private kycStatusUpdates$ = new BehaviorSubject<{ clientId: number; status: KycStatusData } | null>(null);
  private creditBureauStatusUpdates$ = new BehaviorSubject<{ clientId: number; status: CreditBureauStatusData } | null>(
    null
  );

  constructor(private http: HttpClient) {}

  /**
   * Gets KYC status for a client with caching
   * Following State Management KB: Observable-based service design with caching
   */
  getClientKycStatus(clientId: number): Observable<KycStatusData> {
    // Check cache first
    const cached = this.kycStatusCache.get(clientId);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return of(cached.data);
    }

    // Fetch from API with error handling
    return this.http.get<any>(`/clients/${clientId}/extend/kyc`).pipe(
      map((response) => this.mapKycResponse(response)),
      tap((status) => {
        // Update cache
        this.kycStatusCache.set(clientId, {
          data: status,
          timestamp: Date.now()
        });
        // Emit status update
        this.kycStatusUpdates$.next({ clientId, status });
      }),
      catchError((error) => {
        const errorStatus: KycStatusData = {
          status: 'error',
          error: this.getErrorMessage(error)
        };
        return of(errorStatus);
      }),
      shareReplay(1)
    );
  }

  /**
   * Gets Credit Bureau status for a client with caching
   * Following State Management KB: Data caching strategies with proper invalidation
   */
  getClientCreditBureauStatus(clientId: number): Observable<CreditBureauStatusData> {
    // Check cache first
    const cached = this.creditBureauStatusCache.get(clientId);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return of(cached.data);
    }

    // Fetch from API with error handling
    return this.http.get<any>(`/clients/${clientId}/extend/creditreport`).pipe(
      map((response) => this.mapCreditBureauResponse(response)),
      tap((status) => {
        // Update cache
        this.creditBureauStatusCache.set(clientId, {
          data: status,
          timestamp: Date.now()
        });
        // Emit status update
        this.creditBureauStatusUpdates$.next({ clientId, status });
      }),
      catchError((error) => {
        const errorStatus: CreditBureauStatusData = {
          status: 'error',
          error: this.getErrorMessage(error)
        };
        return of(errorStatus);
      }),
      shareReplay(1)
    );
  }

  /**
   * Gets combined status for both KYC and Credit Bureau
   * Following State Management KB: Data transformation and operators
   */
  getCombinedClientStatus(clientId: number): Observable<ClientExtendStatus> {
    return timer(0).pipe(
      switchMap(() => {
        return of(null).pipe(
          switchMap(() => this.getClientKycStatus(clientId)),
          switchMap((kycStatus) =>
            this.getClientCreditBureauStatus(clientId).pipe(
              map((creditBureauStatus) => ({
                clientId,
                kyc: kycStatus,
                creditBureau: creditBureauStatus,
                lastUpdated: new Date()
              }))
            )
          )
        );
      })
    );
  }

  /**
   * Invalidates cache for a specific client
   * Following State Management KB: Cache invalidation strategies
   */
  invalidateClientCache(clientId: number): void {
    this.kycStatusCache.delete(clientId);
    this.creditBureauStatusCache.delete(clientId);
  }

  /**
   * Clears all cached status data
   */
  clearAllCache(): void {
    this.kycStatusCache.clear();
    this.creditBureauStatusCache.clear();
  }

  /**
   * Gets observable for KYC status updates
   * Following State Management KB: Reactive patterns for real-time updates
   */
  getKycStatusUpdates(): Observable<{ clientId: number; status: KycStatusData } | null> {
    return this.kycStatusUpdates$.asObservable();
  }

  /**
   * Gets observable for Credit Bureau status updates
   */
  getCreditBureauStatusUpdates(): Observable<{ clientId: number; status: CreditBureauStatusData } | null> {
    return this.creditBureauStatusUpdates$.asObservable();
  }

  /**
   * Checks if cached data is still valid
   */
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_EXPIRATION_MS;
  }

  /**
   * Maps KYC API response to status data
   * Following State Management KB: Data transformation with type safety
   *
   * Business Logic:
   * - "fully-verified": PAN AND Aadhaar both verified (core documents)
   * - "partially-verified": Either PAN OR Aadhaar verified (but not both)
   * - "not-verified": Neither PAN nor Aadhaar verified
   */
  private mapKycResponse(response: any): KycStatusData {
    if (!response) {
      return { status: 'not-verified' };
    }

    // Handle template response (no KYC data exists)
    if (!response.id) {
      return { status: 'not-verified' };
    }

    // Core document verification status (PAN + Aadhaar are mandatory for full verification)
    const panVerified = Boolean(response.panVerified);
    const aadhaarVerified = Boolean(response.aadhaarVerified);
    const coreDocumentsVerified = panVerified && aadhaarVerified;

    // Count all verified documents for display purposes
    const allVerifiedCount = [
      response.panVerified,
      response.aadhaarVerified,
      response.voterIdVerified,
      response.drivingLicenseVerified,
      response.passportVerified
    ].filter(Boolean).length;

    const totalCount = 5;

    // Determine status based on verification
    if (response.manualUnverificationDate) {
      return {
        status: 'manually-unverified',
        verifiedCount: allVerifiedCount,
        totalCount,
        verificationMethod: 'Manual Unverification'
      };
    }

    // Full verification requires both PAN and Aadhaar
    if (coreDocumentsVerified) {
      return {
        status: 'fully-verified',
        verifiedCount: allVerifiedCount,
        totalCount,
        lastVerifiedOn: response.lastVerifiedOn,
        verificationMethod: response.verificationMethodDescription || 'API Verification'
      };
    }

    // Partial verification if either PAN or Aadhaar is verified (or other documents)
    if (panVerified || aadhaarVerified || allVerifiedCount > 0) {
      return {
        status: 'partially-verified',
        verifiedCount: allVerifiedCount,
        totalCount,
        lastVerifiedOn: response.lastVerifiedOn,
        verificationMethod: response.verificationMethodDescription || 'API Verification'
      };
    }

    return {
      status: 'not-verified',
      verifiedCount: 0,
      totalCount
    };
  }

  /**
   * Maps Credit Bureau API response to status data
   * Following State Management KB: Response type safety and validation
   */
  private mapCreditBureauResponse(response: any): CreditBureauStatusData {
    if (!response || !Array.isArray(response) || response.length === 0) {
      return { status: 'no-report' };
    }

    // Get the most recent report
    const latestReport = response[0];

    if (!latestReport) {
      return { status: 'no-report' };
    }

    // Map status based on report status
    switch (latestReport.reportStatusCode) {
      case 'SUCCESS':
        return {
          status: 'report-available',
          creditScore: latestReport.creditScore,
          creditRating: latestReport.creditRating,
          reportGeneratedOn: latestReport.reportGeneratedOn,
          reportProvider: latestReport.creditBureauProvider
        };
      case 'PENDING':
        return {
          status: 'report-pending',
          reportProvider: latestReport.creditBureauProvider
        };
      case 'FAILURE':
        return {
          status: 'report-failed',
          error: latestReport.errorMessage,
          reportProvider: latestReport.creditBureauProvider
        };
      default:
        return { status: 'no-report' };
    }
  }

  /**
   * Extracts user-friendly error message
   * Following State Management KB: Error handling with user-friendly feedback
   */
  private getErrorMessage(error: any): string {
    if (error?.error?.userMessageGlobalisationCode) {
      return error.error.userMessageGlobalisationCode;
    }
    if (error?.error?.defaultUserMessage) {
      return error.error.defaultUserMessage;
    }
    if (error?.message) {
      return error.message;
    }
    return 'Unknown error occurred';
  }
}
