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
import {
  ClientCreditBureauService,
  CreditBureauReport,
  UpdateCreditReportRequest
} from '../../services/client-credit-bureau.service';

/** Dialog Data Interface */
export interface EditCreditReportDialogData {
  clientId: number;
  report: CreditBureauReport;
  clientData?: any;
  clientIdentifiers?: any[];
  clientKycData?: any;
  clientAddresses?: any[];
}

/**
 * Edit Credit Report Dialog Component
 *
 * Refactored dialog that uses the enhanced shared component exclusively.
 * Following KB patterns:
 * - Component Reusability (kb_angular_architecture.md)
 * - Shared Component Design (kb_ui_components.md)
 * - Feature Module Isolation (kb_critical.md)
 */
@Component({
  selector: 'mifosx-edit-credit-report-dialog',
  templateUrl: './edit-credit-report-dialog.component.html',
  styleUrls: ['./edit-credit-report-dialog.component.scss']
})
export class EditCreditReportDialogComponent implements OnInit {
  isSubmitting = false;

  @ViewChild('creditReportForm') creditReportForm!: SharedCreditReportFormComponent;

  constructor(
    private creditBureauService: ClientCreditBureauService,
    private dialogRef: MatDialogRef<EditCreditReportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditCreditReportDialogData
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
  onSubmit(updateRequest: UpdateCreditReportRequest): void {
    this.isSubmitting = true;

    this.creditBureauService.updateCreditReport(this.data.clientId, this.data.report.id, updateRequest).subscribe({
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
        // NEVER call this.dialogRef.close() here
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
