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

/**
 * Shared Verification Notes Service
 *
 * Provides common utilities for handling verification notes across
 * KYC and credit report components to eliminate code duplication.
 */
@Injectable({
  providedIn: 'root'
})
export class VerificationNotesService {
  /**
   * Extracts verification notes from data object with fallback fields
   */
  extractVerificationNotes(data: any): string {
    if (!data) return '';

    let notes = data.manualVerificationNotes || data.verificationNotes || data.notes || '';

    // Clean up UNVERIFIED prefix if present
    if (notes && notes.startsWith('UNVERIFIED:')) {
      notes = notes.replace('UNVERIFIED: ', '').trim();
    }

    return notes;
  }

  /**
   * Updates verification notes in all possible fields for consistency
   */
  updateVerificationNotes(data: any, notes: string): void {
    if (!data) return;

    data.verificationNotes = notes || null;
    data.manualVerificationNotes = notes || null;
    data.notes = notes || null;
  }

  /**
   * Updates unverification notes with UNVERIFIED prefix
   */
  updateUnverificationNotes(data: any, notes: string): void {
    if (!data) return;

    const unverifiedNotes = `UNVERIFIED: ${notes}`;
    data.manualVerificationNotes = unverifiedNotes;
    data.verificationNotes = unverifiedNotes;
    data.notes = unverifiedNotes;
  }

  /**
   * Updates verification metadata fields
   */
  updateVerificationMetadata(data: any, method: string, user: string, notes: string): void {
    if (!data) return;

    data.lastVerifiedOn = new Date().toISOString().split('T')[0];
    data.lastVerifiedByUsername = user;
    data.verificationMethod = method;
    this.updateVerificationNotes(data, notes);
  }

  /**
   * Updates unverification metadata fields
   */
  updateUnverificationMetadata(data: any, notes: string): void {
    if (!data) return;

    data.lastVerifiedOn = null;
    data.lastVerifiedByUsername = null;
    data.verificationMethod = null;
    this.updateUnverificationNotes(data, notes);
  }

  /**
   * Creates payload with verification notes in multiple field formats
   */
  createPayloadWithNotes(basePayload: any, notes: string): any {
    return {
      ...basePayload,
      verificationNotes: notes || null,
      manualVerificationNotes: notes || null,
      notes: notes || null
    };
  }
}
