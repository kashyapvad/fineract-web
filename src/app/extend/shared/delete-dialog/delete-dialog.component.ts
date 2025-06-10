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
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/** Dialog Data Interface */
export interface DeleteDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

/**
 * Delete Dialog Component
 *
 * Reusable confirmation dialog for destructive actions.
 * Following UI Components KB patterns:
 * - Material Design dialog patterns
 * - Accessibility compliance (WCAG)
 * - Consistent confirmation patterns
 */
@Component({
  selector: 'mifosx-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.scss']
})
export class DeleteDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<DeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteDialogData
  ) {
    // Set default button text if not provided
    this.data.confirmText = this.data.confirmText || 'Delete';
    this.data.cancelText = this.data.cancelText || 'Cancel';
  }

  /**
   * Confirms the deletion
   */
  onConfirm(): void {
    this.dialogRef.close(true);
  }

  /**
   * Cancels the deletion
   */
  onCancel(): void {
    this.dialogRef.close(false);
  }
}
