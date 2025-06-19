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
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Service for generating KYC documents
 * Handles document generation requests to the backend
 */
@Injectable({
  providedIn: 'root'
})
export class KycDocumentGenerationService {
  constructor(private http: HttpClient) {}

  /**
   * Generate KYC document for a client
   * @param clientId The client ID
   * @param templateType The type of document template to use
   * @returns Observable with the generated document
   */
  generateKycDocument(clientId: number, templateType: string): Observable<Blob> {
    const url = `/fineract-provider/api/v1/clients/${clientId}/kyc/documents/${templateType}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  /**
   * Get available document templates
   * @returns Observable with list of available templates
   */
  getAvailableTemplates(): Observable<any[]> {
    const url = '/fineract-provider/api/v1/kyc/document-templates';
    return this.http.get<any[]>(url);
  }
}
