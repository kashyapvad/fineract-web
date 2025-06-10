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
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/** Custom Components */
import { SharedCreditReportFormComponent } from '../shared-credit-report-form/shared-credit-report-form.component';

/** Custom Services */
import { ClientCreditBureauService, CreateCreditReportRequest } from '../../services/client-credit-bureau.service';

/** Dialog Data Interface */
export interface CreateCreditReportDialogData {
  clientId: number;
  clientData?: any;
  clientIdentifiers?: any[];
  clientKycData?: any;
  clientAddresses?: any[];
}

/**
 * Create Credit Report Dialog Component
 *
 * Refactored dialog that uses the enhanced shared component exclusively.
 * Following KB patterns:
 * - Component Reusability (kb_angular_architecture.md)
 * - Shared Component Design (kb_ui_components.md)
 * - Feature Module Isolation (kb_critical.md)
 */
@Component({
  selector: 'mifosx-create-credit-report-dialog',
  templateUrl: './create-credit-report-dialog.component.html',
  styleUrls: ['./create-credit-report-dialog.component.scss']
})
export class CreateCreditReportDialogComponent implements OnInit {
  isSubmitting = false;

  @ViewChild('creditReportForm') creditReportForm!: SharedCreditReportFormComponent;

  constructor(
    private creditBureauService: ClientCreditBureauService,
    private dialogRef: MatDialogRef<CreateCreditReportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CreateCreditReportDialogData
  ) {}

  ngOnInit(): void {
    // Initialization handled by shared component
    // Explicit initialization to satisfy ESLint rule
    this.isSubmitting = false;
  }

  /**
   * Handles form submission from shared component
   * Following State Management KB: Proper error handling in reactive streams
   */
  onSubmit(createRequest: CreateCreditReportRequest): void {
    this.isSubmitting = true;

    this.creditBureauService.createCreditReport(this.data.clientId, createRequest).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        // Only close dialog on successful response
        this.dialogRef.close(response);
      },
      error: (error) => {
        this.isSubmitting = false;
        // CRITICAL FIX: Do NOT close dialog on error
        // Error message is already shown by ErrorHandlerInterceptor
        // Keep dialog open so user can fix issues and retry
      }
    });
  }

  /**
   * Handles submit button click from dialog actions
   * Following Angular Architecture KB: Component Communication Patterns
   */
  onSubmitClick(): void {
    if (this.creditReportForm) {
      this.creditReportForm.onSubmit();
    }
  }

  /**
   * Handles dialog cancellation from shared component
   */
  onCancel(): void {
    this.dialogRef.close();
  }
}
