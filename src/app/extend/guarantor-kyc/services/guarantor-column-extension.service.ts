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
import { Observable, of } from 'rxjs';
import { GuarantorKycService } from './guarantor-kyc.service';

/**
 * Guarantor Column Extension Service
 *
 * Handles loading and caching of extension data for guarantor table columns.
 * This service implements the batch loading pattern to optimize performance
 * for table views that display multiple guarantors with extension data.
 */
@Injectable({
  providedIn: 'root'
})
export class GuarantorColumnExtensionService {
  private readonly EXTEND_COLUMN_ID = 'kycStatus';
  private readonly EXTEND_COLUMN_NAME = 'KYC Status';
  private readonly EXTEND_COLUMN_POSITION = 3; // After 'guarantortype' column

  private guarantorKycStatusCache = new Map<number, any>();

  constructor(private guarantorKycService: GuarantorKycService) {}

  /**
   * Get KYC status for a specific guarantor KYC ID
   * Implements caching to avoid duplicate requests
   */
  getGuarantorKycStatus(guarantorKycId: number): Observable<any> {
    if (this.guarantorKycStatusCache.has(guarantorKycId)) {
      return of(this.guarantorKycStatusCache.get(guarantorKycId));
    }

    // Would load from service in production
    const mockStatus = {
      aadhaarVerified: false,
      panVerified: false,
      verificationStatus: 'Pending',
      lastVerifiedOn: null as Date | null
    };

    this.guarantorKycStatusCache.set(guarantorKycId, mockStatus);
    return of(mockStatus);
  }

  /**
   * Batch load KYC status for multiple guarantor KYC IDs
   * Optimizes table loading by reducing API calls
   */
  loadGuarantorKycStatusBatch(guarantorKycIds: number[]): void {
    if (!guarantorKycIds || guarantorKycIds.length === 0) {
      return;
    }

    // Filter out already cached IDs
    const uncachedIds = guarantorKycIds.filter((id) => !this.guarantorKycStatusCache.has(id));

    if (uncachedIds.length === 0) {
      return;
    }

    // Mock batch loading - would call bulk API in production
    uncachedIds.forEach((id) => {
      const mockStatus = {
        guarantorKycId: id,
        aadhaarVerified: Math.random() > 0.5,
        panVerified: Math.random() > 0.5,
        verificationStatus: Math.random() > 0.5 ? 'Verified' : 'Pending',
        lastVerifiedOn: Math.random() > 0.5 ? new Date() : (null as Date | null)
      };
      this.guarantorKycStatusCache.set(id, mockStatus);
    });
  }

  /**
   * Initialize extension data loading for guarantors table
   * This method should be called when the guarantors data source changes
   */
  initializeExtensionDataLoading(guarantorsData: any[]): void {
    if (!guarantorsData || guarantorsData.length === 0) {
      return;
    }

    // Extract guarantor IDs that need KYC data loading
    const guarantorKycIds = guarantorsData
      .filter((guarantor) => guarantor.guarantorType?.id === 4) // Only GUARANTOR_KYC type
      .map((guarantor) => guarantor.entityId)
      .filter((id) => id);

    if (guarantorKycIds.length > 0) {
      this.loadGuarantorKycStatusBatch(guarantorKycIds);
    }
  }

  /**
   * Clear the cache when needed (e.g., on refresh or logout)
   */
  clearCache(): void {
    this.guarantorKycStatusCache.clear();
  }

  /**
   * Register the KYC Status column extension
   */
  extendColumns(originalColumns: string[]): string[] {
    if (originalColumns.includes(this.EXTEND_COLUMN_ID)) {
      return originalColumns;
    }

    const extendedColumns = [...originalColumns];
    extendedColumns.splice(this.EXTEND_COLUMN_POSITION, 0, this.EXTEND_COLUMN_ID);
    return extendedColumns;
  }
}
