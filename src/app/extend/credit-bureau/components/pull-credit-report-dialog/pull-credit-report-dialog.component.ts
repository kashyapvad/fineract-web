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
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/** Custom Services */
import { ClientCreditBureauService, PullCreditReportRequest } from '../../services/client-credit-bureau.service';

/** Dialog Data Interface */
export interface PullCreditReportDialogData {
  clientId: number;
}

/**
 * Pull Credit Report Dialog Component
 *
 * Dialog for initiating credit report pulls from external providers.
 * Following UI Components KB patterns:
 * - Reactive forms with proper validation
 * - Material Design dialog patterns
 * - Accessibility compliance (WCAG)
 */
@Component({
  selector: 'mifosx-pull-credit-report-dialog',
  templateUrl: './pull-credit-report-dialog.component.html',
  styleUrls: ['./pull-credit-report-dialog.component.scss']
})
export class PullCreditReportDialogComponent implements OnInit {
  pullForm!: FormGroup;
  isSubmitting = false;

  /** Report Type Options */
  reportTypes = [
    { code: 'FULL_REPORT', description: 'Full Credit Report' },
    { code: 'CREDIT_SCORE', description: 'Credit Score Report' },
    { code: 'DATA_PULL', description: 'Customer Data Pull' }
  ];

  /** Provider Options */
  providers = [
    { code: 'DECENTRO', description: 'Decentro' },
    { code: 'CIBIL', description: 'CIBIL' },
    { code: 'EQUIFAX', description: 'Equifax' }
  ];

  constructor(
    private fb: FormBuilder,
    private creditBureauService: ClientCreditBureauService,
    private dialogRef: MatDialogRef<PullCreditReportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PullCreditReportDialogData
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  /**
   * Creates the reactive form with validation
   * Following UI Components KB: Form validation patterns
   */
  private createForm(): void {
    this.pullForm = this.fb.group({
      reportType: [
        'FULL_REPORT',
        [Validators.required]
      ],
      provider: ['DECENTRO'],
      notes: [''],
      panNumber: [
        '',
        [Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]
      ],
      aadhaarNumber: [
        '',
        [Validators.pattern(/^[0-9]{12}$/)]
      ]
    });
  }

  /**
   * Submits the pull request
   */
  onSubmit(): void {
    if (this.pullForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const request: PullCreditReportRequest = this.pullForm.value;

      this.creditBureauService.pullCreditReport(this.data.clientId, request).subscribe({
        next: (result) => {
          this.dialogRef.close(result);
        },
        error: (error) => {
          this.isSubmitting = false;
          // Handle error appropriately
          // Error handling will be done by parent component
        }
      });
    }
  }

  /**
   * Closes the dialog without saving
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Gets form control error message
   */
  getErrorMessage(controlName: string): string {
    const control = this.pullForm.get(controlName);
    if (control?.hasError('required')) {
      return `${controlName} is required`;
    }
    if (control?.hasError('pattern')) {
      if (controlName === 'panNumber') {
        return 'Invalid PAN format (e.g., ABCDE1234F)';
      }
      if (controlName === 'aadhaarNumber') {
        return 'Invalid Aadhaar format (12 digits)';
      }
    }
    return '';
  }
}
