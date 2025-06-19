import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
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
  // Simplified cache - no complex timing or queue management needed with bulk API
  private cache = new Map<number, KycStatusInfo>();
  private cacheSubject = new BehaviorSubject<Map<number, KycStatusInfo>>(new Map());
  public cacheUpdates$ = this.cacheSubject.asObservable();

  // Simple cache timeout - 5 minutes
  private cacheTimeout = 5 * 60 * 1000;
  private cacheTimestamp: number = 0;

  constructor(private kycService: ClientKycService) {}

  /**
   * Bulk load KYC status for multiple clients - MAIN METHOD for table/list components
   * Uses the new bulk API endpoint for optimal performance (1 request vs N requests)
   */
  batchLoadKycStatus(clientIds: number[]): Observable<Map<number, KycStatusInfo>> {
    if (!clientIds || clientIds.length === 0) {
      return of(new Map());
    }

    // Check if cache is still valid for all requested clients
    if (this.isCacheValid(clientIds)) {
      return of(this.getFromCache(clientIds));
    }

    // Use bulk API - single request for all clients
    return this.kycService.getKycDetailsBulk(clientIds).pipe(
      map((bulkResponse: { [key: string]: any }) => {
        const resultMap = new Map<number, KycStatusInfo>();

        // Process each client's KYC data from bulk response
        for (const clientId of clientIds) {
          const clientIdStr = clientId.toString();
          const kycData = bulkResponse[clientIdStr];

          // Process KYC data using existing logic (DRY principle)
          const statusInfo = this.processKycStatus(kycData);

          // Update cache
          this.cache.set(clientId, statusInfo);
          resultMap.set(clientId, statusInfo);
        }

        // Update cache timestamp and notify subscribers
        this.cacheTimestamp = Date.now();
        this.cacheSubject.next(new Map(this.cache));

        return resultMap;
      }),
      catchError((error) => {
        console.warn('Bulk KYC API failed, returning default statuses:', error);

        // Fallback: return default unverified status for all clients
        const fallbackMap = new Map<number, KycStatusInfo>();
        clientIds.forEach((clientId) => {
          const defaultStatus: KycStatusInfo = {
            isVerified: false,
            verifiedDocumentCount: 0,
            totalRequiredDocuments: 2,
            hasRequiredDocuments: false
          };
          fallbackMap.set(clientId, defaultStatus);
          this.cache.set(clientId, defaultStatus);
        });

        this.cacheTimestamp = Date.now();
        this.cacheSubject.next(new Map(this.cache));

        return of(fallbackMap);
      })
    );
  }

  /**
   * Get KYC status for individual client - ONLY for single client scenarios
   * For table/list components, use batchLoadKycStatus instead
   */
  getKycStatusIndividual(clientId: number): Observable<KycStatusInfo> {
    // Check cache first
    if (this.cache.has(clientId) && this.isCacheValid([clientId])) {
      return of(this.cache.get(clientId)!);
    }

    // For individual requests, we can use the bulk API with single client
    // This ensures consistency and reuses the same logic
    return this.batchLoadKycStatus([clientId]).pipe(
      map((resultMap) => resultMap.get(clientId) || this.getDefaultStatus())
    );
  }

  /**
   * Get KYC status from cache synchronously
   */
  getKycStatusFromCache(clientId: number): KycStatusInfo | null {
    return this.cache.get(clientId) || null;
  }

  /**
   * Clear cache for a specific client (e.g., after KYC update)
   */
  clearClientCache(clientId: number): void {
    this.cache.delete(clientId);
    this.cacheSubject.next(new Map(this.cache));
  }

  /**
   * Clear entire cache
   */
  clearAllCache(): void {
    this.cache.clear();
    this.cacheTimestamp = 0;
    this.cacheSubject.next(new Map());
  }

  /**
   * Check if client has verified KYC (PAN and Aadhaar verified)
   */
  isClientKycVerified(clientId: number): Observable<boolean> {
    return this.getKycStatusIndividual(clientId).pipe(map((status) => status.hasRequiredDocuments));
  }

  /**
   * Process KYC data to determine verification status
   * Reused by both individual and bulk processing (DRY principle)
   */
  private processKycStatus(kycData: any): KycStatusInfo {
    if (!kycData) {
      return this.getDefaultStatus();
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

  /**
   * Get default unverified status
   */
  private getDefaultStatus(): KycStatusInfo {
    return {
      isVerified: false,
      verifiedDocumentCount: 0,
      totalRequiredDocuments: 2,
      hasRequiredDocuments: false
    };
  }

  /**
   * Check if cache is valid for the requested client IDs
   */
  private isCacheValid(clientIds: number[]): boolean {
    if (Date.now() - this.cacheTimestamp > this.cacheTimeout) {
      return false;
    }

    // Check if all requested clients are in cache
    return clientIds.every((id) => this.cache.has(id));
  }

  /**
   * Get cached data for specific client IDs
   */
  private getFromCache(clientIds: number[]): Map<number, KycStatusInfo> {
    const result = new Map<number, KycStatusInfo>();
    clientIds.forEach((id) => {
      const cached = this.cache.get(id);
      if (cached) {
        result.set(id, cached);
      }
    });
    return result;
  }
}
