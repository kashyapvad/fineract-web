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
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

/** Custom Services */
import { ClientCreditBureauService, CreditBureauReport } from '../../services/client-credit-bureau.service';

/**
 * Interface for Additional Data Section Display
 * Following UI Components KB: Reusable Component Design patterns
 */
export interface AdditionalDataSection {
  id: string;
  name: string;
  description?: string;
  data: { [key: string]: any };
  isExpanded?: boolean;
}

/**
 * Enhanced View Credit Report Details Component
 *
 * Following Angular Architecture KB patterns:
 * - Route parameter handling for report ID
 * - Reactive programming with takeUntil for subscription management
 * - Material Design components for consistent UI
 * - Error handling with user-friendly feedback
 *
 * Following UI Components KB patterns:
 * - Material Design component usage
 * - Responsive design implementation
 * - Accessibility compliance (WCAG 2.1 AA)
 * - Standardized date formatting with Angular pipes
 *
 * Enhancements:
 * - Additional Data JSON display with section-based organization
 * - Raw JSON display for API-pulled reports (future implementation)
 * - Enhanced error handling for JSON parsing
 * - Responsive design for mobile, tablet, and desktop
 */
@Component({
  selector: 'mifosx-view-credit-report-details',
  templateUrl: './view-credit-report-details.component.html',
  styleUrls: ['./view-credit-report-details.component.scss']
})
export class ViewCreditReportDetailsComponent implements OnInit, OnDestroy {
  /** Route Parameters */
  clientId!: number;
  reportId!: number;

  /** Report Data */
  report: CreditBureauReport | null = null;

  /** Additional Data Processing */
  additionalDataSections: AdditionalDataSection[] = [];
  hasAdditionalData = false;
  additionalDataError: string | null = null;

  /** UI State */
  isLoading = false;
  isAdditionalDataExpanded = false;

  /** Component Lifecycle */
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private creditBureauService: ClientCreditBureauService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.extractRouteParameters();
    this.loadReportDetails();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Extracts client ID and report ID from route parameters
   */
  private extractRouteParameters(): void {
    this.clientId = Number(this.route.snapshot.paramMap.get('clientId'));
    this.reportId = Number(this.route.snapshot.paramMap.get('reportId'));

    if (!this.clientId || !this.reportId) {
      this.showError('Invalid client ID or report ID');
      this.goBack();
    }
  }

  /**
   * Loads detailed credit report information
   */
  private loadReportDetails(): void {
    this.isLoading = true;
    this.changeDetectorRef.detectChanges();

    this.creditBureauService
      .getCreditReport(this.clientId, this.reportId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
        })
      )
      .subscribe({
        next: (report) => {
          this.report = report;
          this.processAdditionalData();
          this.changeDetectorRef.detectChanges();
        },
        error: (error) => {
          console.error('Credit report loading error:', error);
          this.showError('Failed to load credit report details');
        }
      });
  }

  /**
   * Processes Additional Data JSON into organized sections
   * Following UI Components KB: Component Architecture Patterns
   */
  private processAdditionalData(): void {
    if (!this.report?.additionalData) {
      this.hasAdditionalData = false;
      return;
    }

    try {
      let additionalData: any;

      // Handle both string and object formats
      if (typeof this.report.additionalData === 'string') {
        additionalData = JSON.parse(this.report.additionalData);
      } else {
        additionalData = this.report.additionalData;
      }

      // Reset state
      this.additionalDataSections = [];

      // Handle JsonNode structure from backend (with _children)
      if (additionalData && additionalData._children) {
        additionalData = this.parseJsonNodeChildren(additionalData._children);
      }

      // Process sections
      if (typeof additionalData === 'object' && additionalData !== null) {
        Object.keys(additionalData).forEach((key) => {
          const sectionData = additionalData[key];

          // Handle different data structures
          if (typeof sectionData === 'object' && sectionData !== null) {
            // Check if it's a structured section with name, description, data
            if (sectionData.name && sectionData.data) {
              this.additionalDataSections.push({
                id: key,
                name: sectionData.name,
                description: sectionData.description,
                data: this.flattenComplexData(sectionData.data)
              });
            } else {
              // Treat the entire object as data
              this.additionalDataSections.push({
                id: key,
                name: this.formatSectionName(key),
                data: this.flattenComplexData(sectionData)
              });
            }
          } else {
            // Handle primitive values
            this.additionalDataSections.push({
              id: key,
              name: this.formatSectionName(key),
              data: { [key]: sectionData }
            });
          }
        });

        this.hasAdditionalData = this.additionalDataSections.length > 0;
      } else {
        this.hasAdditionalData = false;
      }
    } catch (error) {
      this.additionalDataError = 'Invalid JSON format in additional data';
      this.hasAdditionalData = false;
    }
  }

  /**
   * Parse JsonNode children structure from backend
   */
  private parseJsonNodeChildren(children: any): any {
    if (!children || typeof children !== 'object') {
      return {};
    }

    const result: any = {};
    Object.keys(children).forEach((key) => {
      const child = children[key];
      if (child && child._value !== undefined) {
        result[key] = child._value;
      } else if (child && child._children) {
        result[key] = this.parseJsonNodeChildren(child._children);
      } else {
        result[key] = child;
      }
    });

    return result;
  }

  /**
   * Flatten complex data structures for simple display
   */
  private flattenComplexData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const result: any = {};
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // For complex objects, convert to string representation
        result[key] = JSON.stringify(value);
      } else {
        result[key] = value;
      }
    });

    return result;
  }

  /**
   * Format field label for display
   */
  formatFieldLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/_/g, ' ')
      .replace(/-/g, ' ');
  }

  /**
   * Formats section name for display
   */
  private formatSectionName(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/_/g, ' ')
      .replace(/-/g, ' ');
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
   * Following UI Components KB: Standardized Date Formatting with Angular Pipes
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
   * Formats currency values for display
   */
  formatCurrency(amount?: number): string {
    if (amount === undefined || amount === null) {
      return '-';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  /**
   * Formats JSON value for display
   * Following UI Components KB: Component Architecture Patterns
   */
  formatJsonValue(value: any): string {
    if (value === null || value === undefined) {
      return '-';
    }

    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2);
      } catch (error) {
        return String(value);
      }
    }

    return String(value);
  }

  /**
   * Checks if a value is a complex object (not primitive)
   */
  isComplexValue(value: any): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /**
   * Checks if a value is an array
   */
  isArrayValue(value: any): boolean {
    return Array.isArray(value);
  }

  /**
   * Gets the type of a value for display
   */
  getValueType(value: any): string {
    if (value === null || value === undefined) {
      return 'null';
    }
    if (Array.isArray(value)) {
      return 'array';
    }
    return typeof value;
  }

  /**
   * Toggles expansion state of additional data section
   */
  toggleAdditionalDataExpansion(): void {
    this.isAdditionalDataExpanded = !this.isAdditionalDataExpanded;
  }

  /**
   * Toggles expansion state of a specific section
   */
  toggleSectionExpansion(section: AdditionalDataSection): void {
    section.isExpanded = !section.isExpanded;
  }

  /**
   * Gets object keys for iteration in template
   */
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  /**
   * Shows error message to user
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  /**
   * Navigates back to the credit report management page
   * Following Angular Architecture KB: Proper routing patterns
   */
  goBack(): void {
    // Navigate to the credit report management page
    // Path structure: /clients/:clientId/credit-report
    this.router.navigate([
      '/clients',
      this.clientId,
      'credit-report'
    ]);
  }
}
