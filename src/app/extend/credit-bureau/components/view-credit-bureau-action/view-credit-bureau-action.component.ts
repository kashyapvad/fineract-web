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
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

/** Custom Services */
import { ClientCreditBureauService, CreditBureauReport } from '../../services/client-credit-bureau.service';
import { ClientsService } from 'app/clients/clients.service';
import { ClientKycService } from '../../../kyc/services/client-kyc.service';

/** Custom Components */
import { PullCreditReportDialogComponent } from '../pull-credit-report-dialog/pull-credit-report-dialog.component';
import { CreateCreditReportDialogComponent } from '../create-credit-report-dialog/create-credit-report-dialog.component';
import { EditCreditReportDialogComponent } from '../edit-credit-report-dialog/edit-credit-report-dialog.component';
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';

/**
 * View Credit Bureau Action Component
 *
 * Main management page for client credit bureau reports.
 * Provides comprehensive CRUD operations following Angular Architecture KB patterns:
 * - Feature module isolation with proper component organization
 * - Reactive programming with takeUntil for subscription management
 * - Material Design components for consistent UI
 * - Error handling with user-friendly feedback
 */
@Component({
  selector: 'mifosx-view-credit-bureau-action',
  templateUrl: './view-credit-bureau-action.component.html',
  styleUrls: ['./view-credit-bureau-action.component.scss']
})
export class ViewCreditBureauActionComponent implements OnInit, OnDestroy {
  /** Client ID from route parameters */
  clientId!: number;
  clientData: any = null;
  clientIdentifiers: any[] = [];
  clientKycData: any = null;
  clientAddresses: any[] = [];

  /** Credit Bureau Data */
  creditReports: CreditBureauReport[] = [];

  /** UI State */
  isLoading = false;
  isLoadingReports = false;

  /** Table Configuration */
  displayedColumns: string[] = [
    'reportType',
    'reportStatus',
    'creditScore',
    'creditBureauProvider',
    'reportGeneratedOn',
    'requestedOn',
    'actions'
  ];

  /** Component Lifecycle */
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private creditBureauService: ClientCreditBureauService,
    private clientsService: ClientsService,
    private clientKycService: ClientKycService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    // Get client ID from parent route parameters (clients/:clientId/credit-bureau)
    this.route.parent?.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.clientId = +params['clientId'];
      if (this.clientId) {
        this.loadInitialData();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Loads initial data (client data and KYC data)
   * Following State Management KB: Parallel data loading with error handling
   * OPTIMIZED: Removed unnecessary template call (25% fewer API calls)
   */
  private loadInitialData(): void {
    this.isLoading = true;

    // Load client data, identifiers, KYC data, and addresses in parallel (template removed - not used)
    forkJoin({
      clientData: this.clientsService.getClientData(this.clientId.toString()),
      clientIdentifiers: this.clientsService.getClientIdentifiers(this.clientId.toString()),
      clientKycData: this.clientKycService.getKycDetails(this.clientId),
      clientAddresses: this.clientsService.getClientAddressData(this.clientId.toString())
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (data: any) => {
          this.clientData = data.clientData;
          this.clientIdentifiers = data.clientIdentifiers;
          this.clientKycData = data.clientKycData;
          // Filter to only include active addresses for autofill
          this.clientAddresses = (data.clientAddresses || []).filter((address: any) => address.isActive);
          this.loadCreditReports();
        },
        error: (error: any) => {
          this.showError('Failed to load initial data');
          // Handle load error appropriately
        }
      });
  }

  /**
   * Loads credit reports for the client
   */
  loadCreditReports(): void {
    this.isLoadingReports = true;

    this.creditBureauService
      .getClientCreditReports(this.clientId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoadingReports = false))
      )
      .subscribe({
        next: (reports) => {
          this.creditReports = reports;
        },
        error: (error) => {
          this.showError('Failed to load credit reports');
          // Handle reports load error appropriately
        }
      });
  }

  /**
   * Opens dialog to pull new credit report from provider
   * Following UI Components KB: Dialog patterns with proper data flow
   */
  pullCreditReport(): void {
    const dialogRef = this.dialog.open(PullCreditReportDialogComponent, {
      width: '600px',
      data: {
        clientId: this.clientId
        // template removed - not used effectively
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadCreditReports(); // Refresh the list
        this.showSuccess('Credit report pull initiated successfully');
      }
    });
  }

  /**
   * Opens dialog to create manual credit report with client data auto-fill
   * Following Angular Architecture KB: Component communication patterns
   */
  createManualReport(): void {
    const dialogRef = this.dialog.open(CreateCreditReportDialogComponent, {
      width: '1200px',
      maxWidth: '95vw',
      height: '90vh',
      data: {
        clientId: this.clientId,
        // template removed - not used effectively
        clientData: this.clientData,
        clientIdentifiers: this.clientIdentifiers,
        clientKycData: this.clientKycData,
        clientAddresses: this.clientAddresses
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.resourceId) {
        // Only show success if we have a valid response with resourceId
        this.loadCreditReports(); // Refresh the list
        this.showSuccess('Credit report created successfully');
      } else {
      }
      // If result is null/undefined, dialog was cancelled or error occurred
      // Error messages are already shown by ErrorHandlerInterceptor
    });
  }

  /**
   * Views detailed credit report
   */
  viewReport(report: CreditBureauReport): void {
    this.router.navigate([
      '/clients',
      this.clientId,
      'credit-report',
      'reports',
      report.id
    ]);
  }

  /**
   * Opens dialog to edit credit report
   */
  editReport(report: CreditBureauReport): void {
    const dialogRef = this.dialog.open(EditCreditReportDialogComponent, {
      width: '1200px',
      maxWidth: '95vw',
      height: '90vh',
      data: {
        clientId: this.clientId,
        report: report,
        // template removed - not used effectively
        clientData: this.clientData,
        clientIdentifiers: this.clientIdentifiers,
        clientKycData: this.clientKycData,
        clientAddresses: this.clientAddresses
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && (result.resourceId || result.changes)) {
        // Only show success if we have a valid response with resourceId or changes
        this.loadCreditReports(); // Refresh the list
        this.showSuccess('Credit report updated successfully');
      } else {
      }
      // If result is null/undefined, dialog was cancelled or error occurred
      // Error messages are already shown by ErrorHandlerInterceptor
    });
  }

  /**
   * Deletes credit report with confirmation
   * Following UI Components KB: Confirmation dialogs for destructive actions
   */
  deleteReport(report: CreditBureauReport): void {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Credit Report',
        message: `Are you sure you want to delete the ${this.getReportTypeDisplay(report.reportType)} report generated on ${report.reportGeneratedOn}?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && report.id) {
        this.creditBureauService
          .deleteCreditReport(this.clientId, report.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loadCreditReports(); // Refresh the list
              this.showSuccess('Credit report deleted successfully');
            },
            error: (error) => {
              this.showError('Failed to delete credit report');
              // Handle delete error appropriately
            }
          });
      }
    });
  }

  /**
   * Gets display text for report type
   */
  getReportTypeDisplay(reportType: string): string {
    return this.creditBureauService.getReportTypeDisplay(reportType);
  }

  /**
   * Gets display text for report status
   */
  getReportStatusDisplay(reportStatus: string): string {
    return this.creditBureauService.getReportStatusDisplay(reportStatus);
  }

  /**
   * Gets CSS class for credit rating
   */
  getCreditRatingClass(creditScore?: number): string {
    return this.creditBureauService.getCreditRatingClass(creditScore);
  }

  /**
   * Gets status badge class for report status
   */
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'SUCCESS':
        return 'status-success';
      case 'FAILURE':
        return 'status-error';
      case 'PENDING':
        return 'status-pending';
      default:
        return 'status-unknown';
    }
  }

  /**
   * Converts date array from backend to Date object and formats for display
   * Backend returns dates as arrays: [year, month, day] or [year, month, day, hour, minute, second]
   * Following KYC component pattern for date array handling
   */
  formatDate(dateValue: any): string {
    if (!dateValue) {
      return '-';
    }

    try {
      let dateObj: Date;

      if (Array.isArray(dateValue)) {
        if (dateValue.length >= 3) {
          // Handle date arrays from backend: [year, month, day] or [year, month, day, hour, minute, second]
          const [
            year,
            month,
            day,
            hour = 0,
            minute = 0,
            second = 0
          ] = dateValue;
          // Note: JavaScript Date constructor expects month to be 0-based, but backend sends 1-based
          dateObj = new Date(year, month - 1, day, hour, minute, second);
        } else {
          return '-';
        }
      } else if (dateValue instanceof Date) {
        dateObj = dateValue;
      } else if (typeof dateValue === 'string') {
        dateObj = new Date(dateValue);
      } else {
        return '-';
      }

      // Validate the created date
      if (isNaN(dateObj.getTime())) {
        return '-';
      }

      // Use Angular DatePipe for consistent formatting
      return this.datePipe.transform(dateObj, 'mediumDate') || '-';
    } catch (error) {
      return '-';
    }
  }

  /**
   * Formats currency for display
   */
  formatCurrency(amount?: number): string {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Shows success message
   */
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Shows error message
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Navigates back to client view
   */
  goBack(): void {
    this.router.navigate([
      '/clients',
      this.clientId
    ]);
  }
}
