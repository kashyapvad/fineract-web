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
import { Injectable, ComponentRef, ViewContainerRef, TemplateRef, EmbeddedViewRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { ClientKycStatusService } from '../kyc/services/client-kyc-status.service';

/** Status Badge Components - Removed broken imports, handled by extension directives now */

/**
 * Client Column Extension Service
 *
 * Provides non-invasive dynamic column injection for client table components.
 * Follows Fork Safety patterns from KB Critical:
 * - Zero upstream modifications
 * - Service-based extension pattern
 * - Dynamic component injection
 * - Lifecycle-based initialization
 *
 * This is the PREFERRED method for extending upstream Angular components
 * without modifying core files that could conflict with future updates.
 */
@Injectable({
  providedIn: 'root'
})
export class ClientColumnExtensionService {
  private readonly EXTEND_COLUMNS = [
    'kycStatus',
    'creditBureauStatus'
  ];
  private readonly EXTEND_COLUMN_POSITION = 4; // After 'status' column

  private destroy$ = new Subject<void>();

  constructor(private kycStatusService: ClientKycStatusService) {}

  /**
   * Gets extended columns array for clients table
   * Following Fork Safety Pattern: Returns modified array without side effects
   */
  getExtendedClientTableColumns(originalColumns: string[]): string[] {
    // Only extend if not already extended
    if (this.isAlreadyExtended(originalColumns)) {
      return originalColumns;
    }

    // Create a copy to avoid mutating the original
    const extendedColumns = [...originalColumns];

    // Insert after status column (position 4)
    const insertPosition = Math.min(this.EXTEND_COLUMN_POSITION, extendedColumns.length - 1);

    // Insert KYC status column before the last column (Office Name)
    extendedColumns.splice(insertPosition + 1, 0, 'kycStatus');

    return extendedColumns;
  }

  /**
   * NEW: Initialize extension data loading for clients table
   * This method should be called when the clients data source changes
   */
  initializeExtensionDataLoading(clientsData: any[]): void {
    if (!clientsData || clientsData.length === 0) {
      return;
    }

    console.log(`[Extension Service] Initializing data loading for ${clientsData.length} clients`);

    // Extract client IDs and trigger batch loading
    const clientIds = clientsData.map((client) => client.id).filter((id) => id);

    if (clientIds.length > 0) {
      this.loadKycStatusBatch(clientIds);
    }
  }

  /**
   * Load KYC status for multiple clients using batch loading
   */
  private loadKycStatusBatch(clientIds: number[]): void {
    console.log(`[Extension Service] Loading KYC status for ${clientIds.length} clients`);

    this.kycStatusService
      .batchLoadKycStatus(clientIds)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          console.log(`[Extension Service] KYC batch loading completed`);
        })
      )
      .subscribe(
        (kycStatusMap) => {
          console.log(`[Extension Service] Successfully loaded KYC status for ${kycStatusMap.size} clients`);
          // KYC status data is now cached and available to badge components
        },
        (error) => {
          console.warn('[Extension Service] Error batch loading KYC status:', error);
          // Individual badge components will handle fallbacks
        }
      );
  }

  /**
   * Cleanup method to be called when the service is destroyed
   */
  cleanup(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Extends clients table component with status columns
   * Following Fork Safety Pattern: Dynamic extension without upstream modification
   */
  extendClientsTable(component: any): void {
    if (!component || !component.displayedColumns) {
      return;
    }

    // Only extend if not already extended
    if (this.isAlreadyExtended(component.displayedColumns)) {
      return;
    }

    // Inject status columns into displayedColumns array
    this.injectColumns(component.displayedColumns);

    // Dynamically add column definitions to template
    this.injectColumnDefinitions(component);
  }

  /**
   * Extends client info bar with status badges
   * Following Fork Safety Pattern: Dynamic DOM manipulation without template modification
   */
  extendClientInfoBar(component: any, clientData: any): void {
    if (!component || !clientData) {
      return;
    }

    // Find the left and right tables in client info bar
    const leftTable = this.findInfoBarTable(component, 'left');
    const rightTable = this.findInfoBarTable(component, 'right');

    if (leftTable) {
      this.injectStatusRow(leftTable, 'kyc', clientData.id);
    }

    if (rightTable) {
      this.injectStatusRow(rightTable, 'creditBureau', clientData.id);
    }
  }

  /**
   * Removes extend columns (for cleanup)
   */
  removeExtendColumns(component: any): void {
    if (!component || !component.displayedColumns) {
      return;
    }

    this.EXTEND_COLUMNS.forEach((column) => {
      const index = component.displayedColumns.indexOf(column);
      if (index > -1) {
        component.displayedColumns.splice(index, 1);
      }
    });
  }

  /**
   * Checks if columns are already extended
   */
  private isAlreadyExtended(displayedColumns: string[]): boolean {
    return this.EXTEND_COLUMNS.some((column) => displayedColumns.includes(column));
  }

  /**
   * Injects status columns at the correct position
   */
  private injectColumns(displayedColumns: string[]): void {
    // Insert after status column (position 4)
    const insertPosition = Math.min(this.EXTEND_COLUMN_POSITION, displayedColumns.length - 1);

    // Insert in reverse order to maintain correct sequence
    displayedColumns.splice(insertPosition + 1, 0, 'creditBureauStatus');
    displayedColumns.splice(insertPosition + 1, 0, 'kycStatus');
  }

  /**
   * Dynamically adds column definitions to component template
   * This is the most complex part - we need to inject Angular Material column definitions
   */
  private injectColumnDefinitions(component: any): void {
    // This requires access to the component's template and ViewContainerRef
    // For now, we'll use a simpler approach by extending the component's methods

    if (!component.getColumnDef) {
      component.getColumnDef = (column: string) => this.getColumnDefinition(column);
    }

    if (!component.getCellContent) {
      component.getCellContent = (column: string, row: any) => this.getCellContent(column, row);
    }

    if (!component.getHeaderContent) {
      component.getHeaderContent = (column: string) => this.getHeaderContent(column);
    }
  }

  /**
   * Gets column definition for extend columns
   */
  private getColumnDefinition(column: string): any {
    const definitions: { [key: string]: any } = {
      kycStatus: {
        columnDef: 'kycStatus',
        header: 'labels.inputs.KYC Status',
        sortable: false
      },
      creditBureauStatus: {
        columnDef: 'creditBureauStatus',
        header: 'labels.inputs.Credit Report',
        sortable: false
      }
    };

    return definitions[column] || null;
  }

  /**
   * Gets cell content for extend columns
   */
  private getCellContent(column: string, row: any): any {
    switch (column) {
      case 'kycStatus':
        return {
          component: 'mifosx-kyc-status-badge',
          props: { clientId: row.id, size: 'small' }
        };
      case 'creditBureauStatus':
        return {
          component: 'mifosx-credit-bureau-badge',
          props: { clientId: row.id, size: 'small' }
        };
      default:
        return null;
    }
  }

  /**
   * Gets header content for extend columns
   */
  private getHeaderContent(column: string): string {
    const headers: { [key: string]: string } = {
      kycStatus: 'KYC Status',
      creditBureauStatus: 'Credit Report'
    };

    return headers[column] || column;
  }

  /**
   * Finds info bar table element
   */
  private findInfoBarTable(component: any, side: 'left' | 'right'): Element | null {
    // This would need to be implemented based on the actual DOM structure
    // For now, return null as a placeholder
    return null;
  }

  /**
   * Injects status row into info bar table
   */
  private injectStatusRow(table: Element, type: 'kyc' | 'creditBureau', clientId: number): void {
    // This would need to be implemented based on the actual DOM structure
    // For now, this is a placeholder
  }
}

/**
 * Extension Initializer Service
 * Provides lifecycle management for client extensions
 */
@Injectable({
  providedIn: 'root'
})
export class ClientExtensionInitializerService {
  constructor(private columnExtensionService: ClientColumnExtensionService) {}

  /**
   * Initialize extensions for a component
   * Following Fork Safety Pattern: Non-invasive initialization
   */
  initializeExtensions(component: any, type: 'table' | 'infoBar', data?: any): void {
    switch (type) {
      case 'table':
        this.columnExtensionService.extendClientsTable(component);
        // Initialize data loading if data is provided
        if (data && Array.isArray(data)) {
          this.columnExtensionService.initializeExtensionDataLoading(data);
        }
        break;
      case 'infoBar':
        this.columnExtensionService.extendClientInfoBar(component, data);
        break;
    }
  }

  /**
   * Cleanup extensions for a component
   */
  cleanupExtensions(component: any): void {
    this.columnExtensionService.removeExtendColumns(component);
    this.columnExtensionService.cleanup();
  }
}
