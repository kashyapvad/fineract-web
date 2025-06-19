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

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Client KYC Service
 *
 * Provides HTTP operations for KYC management including:
 * - Retrieving KYC details and templates
 * - Creating and updating KYC records
 * - API-based and manual verification operations
 * - Unverification operations
 *
 * Following Angular Architecture KB patterns:
 * - Service layer abstraction for HTTP operations
 * - Observable-based reactive patterns
 * - Proper error handling and type safety
 * - RESTful API communication
 *
 * IMPORTANT: All endpoints correspond to real backend APIs in ClientKycApiResource.java
 * All errors are propagated to components for proper handling - no mock data or fallback responses.
 */
@Injectable({
  providedIn: 'root'
})
export class ClientKycService {
  constructor(private http: HttpClient) {}

  /**
   * Retrieves KYC details for a specific client
   * Endpoint: GET /v1/clients/{clientId}/extend/kyc
   */
  getKycDetails(clientId: number): Observable<any> {
    return this.http.get(`/v1/clients/${clientId}/extend/kyc`);
  }

  // Removed getMockKycData method - violates DRY principle and "No Mock Data" rule

  /**
   * Retrieves KYC template for a specific client
   * Endpoint: GET /v1/clients/{clientId}/extend/kyc/template
   */
  getKycTemplate(clientId: number): Observable<any> {
    return this.http.get(`/v1/clients/${clientId}/extend/kyc/template`);
  }

  /**
   * Creates new KYC details for a client
   * Endpoint: POST /v1/clients/{clientId}/extend/kyc
   */
  createKycDetails(clientId: number, kycData: any): Observable<any> {
    return this.http.post(`/v1/clients/${clientId}/extend/kyc`, kycData);
  }

  /**
   * Updates existing KYC details for a client
   * Endpoint: PUT /v1/clients/{clientId}/extend/kyc/{kycId}
   */
  updateKycDetails(clientId: number, kycId: number, kycData: any): Observable<any> {
    return this.http.put(`/v1/clients/${clientId}/extend/kyc/${kycId}`, kycData);
  }

  /**
   * Deletes KYC details for a client
   * Endpoint: DELETE /v1/clients/{clientId}/extend/kyc/{kycId}
   */
  deleteKycDetails(clientId: number, kycId: number): Observable<any> {
    return this.http.delete(`/v1/clients/${clientId}/extend/kyc/${kycId}`);
  }

  /**
   * Initiates API-based verification of KYC documents
   * Endpoint: POST /v1/clients/{clientId}/extend/kyc/verify
   */
  verifyKycViaApi(clientId: number, verificationData: any): Observable<any> {
    return this.http.post(`/v1/clients/${clientId}/extend/kyc/verify`, verificationData);
  }

  /**
   * Performs manual verification of KYC documents
   * Endpoint: PUT /v1/clients/{clientId}/extend/kyc/verify/manual
   */
  verifyKycManually(clientId: number, verificationData: any): Observable<any> {
    return this.http.put(`/v1/clients/${clientId}/extend/kyc/verify/manual`, verificationData);
  }

  /**
   * Performs manual unverification of KYC documents
   * Endpoint: PUT /v1/clients/{clientId}/extend/kyc/unverify/manual
   */
  unverifyKycManually(clientId: number, unverificationData: any): Observable<any> {
    return this.http.put(`/v1/clients/${clientId}/extend/kyc/unverify/manual`, unverificationData);
  }
}
