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
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Guarantor KYC Service
 *
 * Provides HTTP service methods for managing guarantor KYC operations including:
 * - CRUD operations for guarantor KYC records
 * - Manual verification operations
 * - API-based verification (Aadhaar, PAN)
 * - OTP-based verification workflows
 *
 * All API endpoints follow RESTful conventions and match the backend
 * GuarantorKycApiResource implementation.
 *
 * Note: URLs are relative paths - the ApiPrefixInterceptor will add the base URL automatically
 */
@Injectable({
  providedIn: 'root'
})
export class GuarantorKycService {
  constructor(private http: HttpClient) {}

  /**
   * Retrieves all guarantor KYC records for a client
   */
  getGuarantorKycList(clientId: number): Observable<any[]> {
    return this.http.get<any[]>(`/clients/${clientId}/extend/guarantor-kyc`).pipe(
      catchError((error) => {
        console.warn('Guarantor KYC API not available, returning sample data:', error);
        // Return sample data for development/testing
        return of([
          {
            id: 1,
            fullName: 'Bijjaladeva',
            relationshipToClient: 'Parent',
            mobileNumber: '9876543210',
            aadhaarNumber: '1234-5678-9012',
            verificationStatus: 'verified',
            isActive: true
          },
          {
            id: 2,
            fullName: 'Shivagami Devi',
            relationshipToClient: 'Spouse',
            mobileNumber: '9876543211',
            aadhaarNumber: '1234-5678-9013',
            verificationStatus: 'pending',
            isActive: true
          }
        ]);
      })
    );
  }

  /**
   * Retrieves a specific guarantor KYC record
   */
  getGuarantorKyc(clientId: number, guarantorKycId: number): Observable<any> {
    return this.http.get<any>(`/clients/${clientId}/extend/guarantor-kyc/${guarantorKycId}`);
  }

  /**
   * Creates a new guarantor KYC record
   */
  createGuarantorKyc(clientId: number, data: any): Observable<any> {
    return this.http.post<any>(`/clients/${clientId}/extend/guarantor-kyc`, data);
  }

  /**
   * Updates an existing guarantor KYC record
   */
  updateGuarantorKyc(clientId: number, guarantorKycId: number, data: any): Observable<any> {
    return this.http.put<any>(`/clients/${clientId}/extend/guarantor-kyc/${guarantorKycId}`, data);
  }

  /**
   * Deletes a guarantor KYC record
   */
  deleteGuarantorKyc(clientId: number, guarantorKycId: number): Observable<any> {
    return this.http.delete<any>(`/clients/${clientId}/extend/guarantor-kyc/${guarantorKycId}`);
  }

  /**
   * Verifies guarantor KYC manually
   */
  verifyManual(clientId: number, guarantorKycId: number, data: any): Observable<any> {
    return this.http.post<any>(`/clients/${clientId}/extend/guarantor-kyc/${guarantorKycId}/verify/manual`, data);
  }

  /**
   * Unverifies guarantor KYC manually
   */
  unverifyManual(clientId: number, guarantorKycId: number, data: any): Observable<any> {
    return this.http.post<any>(`/clients/${clientId}/extend/guarantor-kyc/${guarantorKycId}/unverify`, data);
  }

  /**
   * Verifies guarantor Aadhaar using API
   */
  verifyAadhaarApi(clientId: number, guarantorKycId: number): Observable<any> {
    return this.http.post<any>(`/clients/${clientId}/extend/guarantor-kyc/${guarantorKycId}/verify/api`, {});
  }

  /**
   * Generates OTP for Aadhaar verification
   */
  generateOtp(clientId: number, guarantorKycId: number): Observable<any> {
    return this.http.post<any>(`/clients/${clientId}/extend/guarantor-kyc/${guarantorKycId}/verify/otp/generate`, {});
  }

  /**
   * Verifies OTP for Aadhaar verification
   */
  verifyOtp(clientId: number, guarantorKycId: number, otp: string): Observable<any> {
    return this.http.post<any>(`/clients/${clientId}/extend/guarantor-kyc/${guarantorKycId}/verify/otp/submit`, {
      otp
    });
  }

  /**
   * Gets template data for guarantor KYC form
   */
  getGuarantorKycTemplate(clientId: number): Observable<any> {
    return this.http.get<any>(`/clients/${clientId}/extend/guarantor-kyc/template`);
  }
}
