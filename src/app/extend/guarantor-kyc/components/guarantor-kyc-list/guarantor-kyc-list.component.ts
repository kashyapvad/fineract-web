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
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/** Custom Services */
import { GuarantorKycService } from '../../services/guarantor-kyc.service';

/** Dialog Components */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

// Angular and Material imports - specific imports to avoid circular dependencies
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';

// Extension Components
import { KycStatusBadgeComponent } from '../../../components/kyc-status-badge.component';

// Pipes
import { RelationshipDisplayPipe } from 'app/pipes/relationship-display.pipe';

/**
 * Guarantor KYC List Component
 *
 * Displays a comprehensive list of all guarantor KYC records for a client including:
 * - Tabular view with guarantor details and verification status
 * - Action buttons for create, edit, view, and delete operations
 * - Verification status indicators
 *
 * This component follows Material Design patterns and provides a user-friendly
 * interface for managing multiple guarantors for a single client.
 */
@Component({
  selector: 'mifosx-guarantor-kyc-list',
  templateUrl: './guarantor-kyc-list.component.html',
  styleUrls: ['./guarantor-kyc-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatSnackBarModule,
    TranslateModule,
    KycStatusBadgeComponent,
    RelationshipDisplayPipe
  ]
})
export class GuarantorKycListComponent implements OnInit, OnDestroy {
  /** Component Data */
  clientId: number;
  guarantorKycData: any[] = [];
  isLoading = false;

  /** Table Configuration */
  dataSource = new MatTableDataSource<any>();
  displayedColumns = [
    'fullName',
    'relationshipToClient',
    'mobileNumber',
    'aadhaarNumber',
    'verificationStatus',
    'isActive',
    'actions'
  ];

  /** Reactive Cleanup */
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private guarantorKycService: GuarantorKycService
  ) {
    this.clientId = this.route.parent?.snapshot.params['clientId'];
  }

  ngOnInit(): void {
    this.loadGuarantorKycData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Loads all guarantor KYC data for the client
   */
  loadGuarantorKycData(): void {
    this.isLoading = true;
    this.guarantorKycService
      .getGuarantorKycList(this.clientId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.guarantorKycData = data;
          this.dataSource.data = data;
          this.isLoading = false;
        },
        error: (error) => {
          this.showError('Error loading guarantor KYC data');
          this.isLoading = false;
        }
      });
  }

  /**
   * Navigates to create new guarantor KYC form
   */
  createGuarantorKyc(): void {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  /**
   * Navigates to view guarantor KYC details
   */
  viewGuarantorKyc(guarantorKycId: number): void {
    this.router.navigate([guarantorKycId], { relativeTo: this.route });
  }

  /**
   * Navigates to edit guarantor KYC form
   */
  editGuarantorKyc(guarantorKycId: number): void {
    this.router.navigate(
      [
        guarantorKycId,
        'edit'
      ],
      { relativeTo: this.route }
    );
  }

  /**
   * Deletes guarantor KYC with confirmation dialog
   */
  deleteGuarantorKyc(guarantorKyc: any): void {
    const confirmMessage = `Are you sure you want to delete the guarantor KYC record for ${guarantorKyc.fullName}?`;

    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: {
        deleteContext: `Guarantor KYC Record: ${guarantorKyc.fullName}`,
        message: confirmMessage
      }
    });

    dialogRef.afterClosed().subscribe((response) => {
      if (response.delete) {
        this.performDelete(guarantorKyc.id);
      }
    });
  }

  /**
   * Performs the actual delete operation
   */
  private performDelete(guarantorKycId: number): void {
    this.isLoading = true;
    this.guarantorKycService
      .deleteGuarantorKyc(this.clientId, guarantorKycId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Guarantor KYC deleted successfully');
          this.loadGuarantorKycData();
        },
        error: (error) => {
          this.showError('Error deleting guarantor KYC');
          this.isLoading = false;
        }
      });
  }

  /**
   * Displays success message
   */
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Displays error message
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}
