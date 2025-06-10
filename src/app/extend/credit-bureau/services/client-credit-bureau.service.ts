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
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Enhanced Credit Bureau Report interface with all backend entity fields
 * Following State Management KB: Type-safe interfaces for API communication
 */
export interface CreditBureauReport {
  id?: number;
  clientId: number;
  clientName?: string;
  clientDisplayName?: string;

  // Report Details
  reportType: 'FULL_REPORT' | 'CREDIT_SCORE' | 'DATA_PULL' | 'MANUAL_ENTRY';
  reportTypeCode?: string;
  reportTypeDescription?: string;
  reportStatus: 'SUCCESS' | 'FAILURE' | 'PENDING';
  reportStatusCode?: string;
  reportStatusDescription?: string;

  // Provider Information
  creditBureauProvider?: string;
  providerReportId?: string;

  // Primary Credit Score Information (calculated from multiple scores)
  primaryCreditScore?: number;
  primaryCreditRating?: string;
  totalScoreModels?: number;

  // Report Metadata
  reportGeneratedOn?: string;
  requestedOn?: string;
  requestedByUserId?: number;
  requestedByUsername?: string;

  // Report Data
  reportData?: any;
  additionalData?: any;
  reportSummary?: string;
  reportNotes?: string;

  // Enhanced Customer Information (NEW fields added)
  customerName?: string;
  customerPan?: string;
  customerAadhaar?: string;
  customerMobile?: string;
  customerAddress?: string; // NEW
  dateOfBirth?: string; // NEW
  gender?: string; // NEW

  // Financial Information
  totalAccounts?: number;
  activeAccounts?: number;
  closedAccounts?: number;
  overdueAccounts?: number;
  totalCreditLimit?: number;
  totalOutstandingAmount?: number;
  totalOverdueAmount?: number;
  highestCreditAmount?: number; // NEW

  // Delinquency Information
  daysPastDue?: number;
  worstStatus12Months?: string;
  worstStatus24Months?: string;

  // Enquiry Information
  enquiriesLast30Days?: number;
  enquiriesLast90Days?: number;
  enquiriesLast12Months?: number;

  // Error Information
  errorCode?: string;
  errorMessage?: string;

  // Raw Provider Response (for audit and debugging)
  rawProviderResponse?: any;

  // Enhanced Credit Scores (separate entity relationship)
  creditScores?: EnhancedCreditScore[];

  // Audit Information
  createdDate?: string;
  lastModifiedDate?: string;
  createdByUserId?: number;
  lastModifiedByUserId?: number;
}

export interface PullCreditReportRequest {
  reportType: 'FULL_REPORT' | 'CREDIT_SCORE' | 'DATA_PULL';
  provider?: string;
  notes?: string;
  panNumber?: string;
  aadhaarNumber?: string;
}

/**
 * Enhanced Credit Score interface with all backend entity fields
 */
export interface CreditScore {
  scoreModel: string;
  creditScore: number;
  scoreVersion?: string;
  scoreName?: string;
  scoreReason?: string;
}

/**
 * Extended Credit Score interface with all backend fields
 */
export interface EnhancedCreditScore extends CreditScore {
  // Additional scoring metadata
  scoreDate?: string;
  scoreRangeMin?: number;
  scoreRangeMax?: number;
  scorePercentile?: number;

  // Advanced scoring data
  scoringElements?: any; // JSON field for scoring factors
  providerScoreId?: string;
  providerMetadata?: any; // JSON field for provider-specific data

  // Calculated fields
  scoreRating?: string; // EXCELLENT, GOOD, FAIR, POOR, VERY_POOR
}

/**
 * Enhanced Create Credit Report Request with all fields
 */
export interface CreateCreditReportRequest {
  reportType: 'MANUAL_ENTRY';
  creditBureauProvider?: string;

  // Support both single score (backward compatibility) and multiple scores
  creditScore?: number;
  scoreModel?: string;
  creditScores?: EnhancedCreditScore[];

  // Report metadata
  reportSummary?: string;
  reportNotes?: string;
  additionalData?: any;

  // Enhanced customer information
  customerName?: string;
  customerPan?: string;
  customerAadhaar?: string;
  customerMobile?: string;
  customerAddress?: string; // NEW
  dateOfBirth?: string; // NEW
  gender?: string; // NEW

  // Financial information
  totalAccounts?: number;
  activeAccounts?: number;
  closedAccounts?: number;
  overdueAccounts?: number;
  totalCreditLimit?: number;
  totalOutstandingAmount?: number;
  totalOverdueAmount?: number;
  highestCreditAmount?: number; // NEW

  // Delinquency information
  daysPastDue?: number;
  worstStatus12Months?: string;
  worstStatus24Months?: string;

  // Enquiry information
  enquiriesLast30Days?: number;
  enquiriesLast90Days?: number;
  enquiriesLast12Months?: number;
}

/**
 * Enhanced Update Credit Report Request with all fields
 */
export interface UpdateCreditReportRequest {
  // Support both single score (backward compatibility) and multiple scores
  creditScore?: number;
  scoreModel?: string;
  creditScores?: EnhancedCreditScore[];

  // Report metadata
  reportSummary?: string;
  reportNotes?: string;
  additionalData?: any;

  // Enhanced customer information
  customerName?: string;
  customerPan?: string;
  customerAadhaar?: string;
  customerMobile?: string;
  customerAddress?: string; // NEW
  dateOfBirth?: string; // NEW
  gender?: string; // NEW

  // Financial information
  totalAccounts?: number;
  activeAccounts?: number;
  closedAccounts?: number;
  overdueAccounts?: number;
  totalCreditLimit?: number;
  totalOutstandingAmount?: number;
  totalOverdueAmount?: number;
  highestCreditAmount?: number; // NEW

  // Delinquency information
  daysPastDue?: number;
  worstStatus12Months?: string;
  worstStatus24Months?: string;

  // Enquiry information
  enquiriesLast30Days?: number;
  enquiriesLast90Days?: number;
  enquiriesLast12Months?: number;
}

/**
 * Enhanced Client Credit Bureau Service
 *
 * Following State Management KB: Observable-based reactive programming
 * Following Angular Architecture KB: HTTP service abstraction patterns
 *
 * Enhancements:
 * - Complete field coverage for all backend entity fields
 * - Enhanced type safety with comprehensive interfaces
 * - Support for advanced credit scoring models
 * - JSON data management for complex fields
 */
@Injectable({
  providedIn: 'root'
})
export class ClientCreditBureauService {
  constructor(private http: HttpClient) {}

  /**
   * Retrieves all credit bureau reports for a client
   * Following State Management KB: Observable-based service design
   */
  getClientCreditReports(clientId: number): Observable<CreditBureauReport[]> {
    return this.http.get<CreditBureauReport[]>(`/clients/${clientId}/extend/creditreport/reports`);
  }

  /**
   * Retrieves a specific credit bureau report
   */
  getCreditReport(clientId: number, reportId: number): Observable<CreditBureauReport> {
    return this.http.get<CreditBureauReport>(`/clients/${clientId}/extend/creditreport/reports/${reportId}`);
  }

  /**
   * Pulls a new credit report from external provider
   * Following State Management KB: HTTP POST with proper request typing
   */
  pullCreditReport(clientId: number, request: PullCreditReportRequest): Observable<any> {
    return this.http.post(`/clients/${clientId}/extend/creditreport/pull`, request);
  }

  /**
   * Creates a new credit report manually with enhanced data
   */
  createCreditReport(clientId: number, request: CreateCreditReportRequest): Observable<any> {
    return this.http.post(`/clients/${clientId}/extend/creditreport/create`, request);
  }

  /**
   * Updates an existing credit report with enhanced data
   */
  updateCreditReport(clientId: number, reportId: number, request: UpdateCreditReportRequest): Observable<any> {
    return this.http.put(`/clients/${clientId}/extend/creditreport/reports/${reportId}`, request);
  }

  /**
   * Deletes a credit report
   */
  deleteCreditReport(clientId: number, reportId: number): Observable<any> {
    return this.http.delete(`/clients/${clientId}/extend/creditreport/reports/${reportId}`);
  }

  /**
   * Helper method to get report type display text
   */
  getReportTypeDisplay(reportType: string): string {
    switch (reportType) {
      case 'FULL_REPORT':
        return 'Full Credit Report';
      case 'CREDIT_SCORE':
        return 'Credit Score Report';
      case 'DATA_PULL':
        return 'Customer Data Pull';
      case 'MANUAL_ENTRY':
        return 'Manual Entry';
      default:
        return reportType;
    }
  }

  /**
   * Helper method to get report status display text
   */
  getReportStatusDisplay(reportStatus: string): string {
    switch (reportStatus) {
      case 'SUCCESS':
        return 'Success';
      case 'FAILURE':
        return 'Failed';
      case 'PENDING':
        return 'Pending';
      default:
        return reportStatus;
    }
  }

  /**
   * Enhanced helper method to get credit rating color class with score ranges
   */
  getCreditRatingClass(creditScore?: number): string {
    if (!creditScore) return 'rating-unknown';

    if (creditScore >= 750) return 'rating-excellent';
    if (creditScore >= 700) return 'rating-good';
    if (creditScore >= 650) return 'rating-fair';
    if (creditScore >= 600) return 'rating-poor';
    return 'rating-very-poor';
  }

  /**
   * NEW: Helper method to get credit rating text
   */
  getCreditRatingText(creditScore?: number): string {
    if (!creditScore) return 'Unknown';

    if (creditScore >= 750) return 'Excellent';
    if (creditScore >= 700) return 'Good';
    if (creditScore >= 650) return 'Fair';
    if (creditScore >= 600) return 'Poor';
    return 'Very Poor';
  }

  /**
   * NEW: Helper method to validate score range
   */
  isScoreInValidRange(score: number, minRange?: number, maxRange?: number): boolean {
    const min = minRange || 300;
    const max = maxRange || 900;
    return score >= min && score <= max;
  }

  /**
   * NEW: Helper method to calculate score percentile
   */
  calculateScorePercentile(score: number, minRange: number = 300, maxRange: number = 900): number {
    if (score < minRange) return 0;
    if (score > maxRange) return 100;
    return ((score - minRange) / (maxRange - minRange)) * 100;
  }

  /**
   * NEW: Helper method to format JSON data for display
   */
  formatJsonForDisplay(jsonData: any): string {
    try {
      return JSON.stringify(jsonData, null, 2);
    } catch {
      return String(jsonData);
    }
  }
}
