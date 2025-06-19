import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject, EMPTY, timer } from 'rxjs';
import { map, catchError, shareReplay, tap, concatMap, delay, debounceTime, switchMap } from 'rxjs/operators';
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
  // Cache for batch loaded data - this is the primary cache
  private batchCache = new Map<number, KycStatusInfo>();
  private batchLoadSubject = new BehaviorSubject<Map<number, KycStatusInfo>>(new Map());
  public batchLoadStatus$ = this.batchLoadSubject.asObservable();

  // Cache timeout for all data
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private cacheTimestamps = new Map<number, number>();

  // Request deduplication
  private pendingRequests = new Set<number>();
  private requestQueue = new Set<number>();

  // Debouncing for batch requests
  private batchRequestSubject = new BehaviorSubject<number[]>([]);
  private isProcessingBatch = false;

  constructor(private kycService: ClientKycService) {
    // Set up debounced batch processing
    this.setupBatchProcessor();
  }

  /**
   * Setup debounced batch processor to handle multiple requests efficiently
   */
  private setupBatchProcessor(): void {
    this.batchRequestSubject
      .pipe(
        debounceTime(500), // Wait 500ms for more requests to accumulate
        switchMap((clientIds) => {
          if (clientIds.length === 0 || this.isProcessingBatch) {
            return EMPTY;
          }
          return this.processBatchRequest(clientIds);
        })
      )
      .subscribe();
  }

  /**
   * Batch load KYC status for multiple clients at once
   * This is the PREFERRED method and should be used by table/list components
   */
  batchLoadKycStatus(clientIds: number[]): Observable<Map<number, KycStatusInfo>> {
    if (!clientIds || clientIds.length === 0) {
      return of(new Map());
    }

    // Add to request queue for debounced processing
    clientIds.forEach((id) => this.requestQueue.add(id));
    this.batchRequestSubject.next(Array.from(this.requestQueue));

    // Return immediate results from cache, plus future updates
    return this.batchLoadStatus$.pipe(
      map(() => {
        const results = new Map<number, KycStatusInfo>();
        clientIds.forEach((id) => {
          if (this.batchCache.has(id)) {
            results.set(id, this.batchCache.get(id)!);
          }
        });
        return results;
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  /**
   * Process batch request with sequential loading to reduce server load
   */
  private processBatchRequest(clientIds: number[]): Observable<void> {
    this.isProcessingBatch = true;

    // Filter out already cached clients (within cache timeout)
    const now = Date.now();
    const uncachedClientIds = clientIds.filter((id) => {
      const lastCached = this.cacheTimestamps.get(id);
      const isNotCached = !this.batchCache.has(id) || !lastCached || now - lastCached > this.cacheTimeout;
      const isNotPending = !this.pendingRequests.has(id);
      return isNotCached && isNotPending;
    });

    if (uncachedClientIds.length === 0) {
      this.isProcessingBatch = false;
      this.requestQueue.clear();
      return of(void 0);
    }

    // Process requests sequentially with small delays to avoid overwhelming server
    return of(...uncachedClientIds).pipe(
      concatMap((clientId, index) => {
        // Mark as pending
        this.pendingRequests.add(clientId);

        return this.kycService.getKycDetails(clientId).pipe(
          map((kycData) => this.processKycStatus(kycData)),
          catchError((error) => {
            // Return default unverified status for failed requests
            return of({
              isVerified: false,
              verifiedDocumentCount: 0,
              totalRequiredDocuments: 2,
              hasRequiredDocuments: false
            });
          }),
          tap((status) => {
            // Update cache
            this.batchCache.set(clientId, status);
            this.cacheTimestamps.set(clientId, Date.now());
            this.pendingRequests.delete(clientId);

            // Notify subscribers immediately for each loaded client
            this.batchLoadSubject.next(new Map(this.batchCache));
          }),
          // Small delay between requests to be gentle on server
          delay(100)
        );
      }),
      tap({
        complete: (): void => {
          this.isProcessingBatch = false;
          this.requestQueue.clear();
        }
      }),
      map(() => void 0)
    );
  }

  /**
   * Get KYC status for individual client - ONLY for non-batch scenarios
   * This should be avoided in table/list components
   */
  getKycStatusIndividual(clientId: number): Observable<KycStatusInfo> {
    // Check batch cache first
    if (this.batchCache.has(clientId)) {
      const now = Date.now();
      const lastCached = this.cacheTimestamps.get(clientId);
      if (lastCached && now - lastCached < this.cacheTimeout) {
        return of(this.batchCache.get(clientId)!);
      }
    }

    // Check if request is already pending
    if (this.pendingRequests.has(clientId)) {
      return this.batchLoadStatus$.pipe(
        map((): KycStatusInfo | undefined => this.batchCache.get(clientId)),
        map(
          (status): KycStatusInfo =>
            status || {
              isVerified: false,
              verifiedDocumentCount: 0,
              totalRequiredDocuments: 2,
              hasRequiredDocuments: false
            }
        )
      );
    }

    // Mark as pending
    this.pendingRequests.add(clientId);

    // Create new individual request
    return this.kycService.getKycDetails(clientId).pipe(
      map((kycData) => this.processKycStatus(kycData)),
      catchError((error) => {
        return of({
          isVerified: false,
          verifiedDocumentCount: 0,
          totalRequiredDocuments: 2,
          hasRequiredDocuments: false
        });
      }),
      tap((status) => {
        // Update cache
        this.batchCache.set(clientId, status);
        this.cacheTimestamps.set(clientId, Date.now());
        this.pendingRequests.delete(clientId);
        // Notify batch subscribers
        this.batchLoadSubject.next(new Map(this.batchCache));
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  /**
   * Get KYC status from cache synchronously (for components that have pre-loaded data)
   */
  getKycStatusFromCache(clientId: number): KycStatusInfo | null {
    const status = this.batchCache.get(clientId) || null;
    if (status) {
    } else {
    }
    return status;
  }

  /**
   * Clear cache for a specific client (e.g., after KYC update)
   */
  clearClientCache(clientId: number): void {
    this.batchCache.delete(clientId);
    this.cacheTimestamps.delete(clientId);
    this.pendingRequests.delete(clientId);
    this.requestQueue.delete(clientId);

    // Notify subscribers of cache update
    this.batchLoadSubject.next(new Map(this.batchCache));
  }

  /**
   * Clear entire cache
   */
  clearAllCache(): void {
    this.batchCache.clear();
    this.cacheTimestamps.clear();
    this.pendingRequests.clear();
    this.requestQueue.clear();
    this.batchLoadSubject.next(new Map());
  }

  /**
   * Check if client has verified KYC (PAN and Aadhaar verified)
   */
  isClientKycVerified(clientId: number): Observable<boolean> {
    return this.getKycStatusIndividual(clientId).pipe(map((status) => status.hasRequiredDocuments));
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
