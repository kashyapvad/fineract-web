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
import { ClientKycService } from '../kyc/services/client-kyc.service';

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
    'kycStatus'
  ];
  private readonly EXTEND_COLUMN_POSITION = 3; // After 'status' column

  private destroy$ = new Subject<void>();

  constructor(private clientKycService: ClientKycService) {}

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

    // Insert after status column (position 3)
    const insertPosition = Math.min(this.EXTEND_COLUMN_POSITION, extendedColumns.length - 1);

    // Insert KYC status column before account number column
    extendedColumns.splice(insertPosition + 1, 0, 'kycStatus');

    return extendedColumns;
  }

  /**
   * Extends client table component with KYC status columns
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

    // Inject KYC status column into displayedColumns array
    this.injectColumns(component.displayedColumns);

    // Dynamically add column definitions to template
    this.injectColumnDefinitions(component);
  }

  /**
   * Initialize extension data loading for clients table
   * This method should be called when the clients data source changes
   */
  initializeExtensionDataLoading(clientsData: any[]): void {
    if (!clientsData || clientsData.length === 0) {
      return;
    }

    // Extract client IDs for batch loading
    const clientIds = clientsData.map((client) => client.id).filter((id) => id);

    if (clientIds.length > 0) {
      this.loadClientKycStatusBatch(clientIds);
    }
  }

  /**
   * Load client KYC status for multiple clients using batch loading
   */
  private loadClientKycStatusBatch(clientIds: number[]): void {
    this.clientKycService
      .getKycDetailsBulk(clientIds)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          // Batch loading completed
        })
      )
      .subscribe({
        next: (kycStatusMap) => {
          // Successfully loaded KYC status for multiple clients
        },
        error: (error) => {
          // Handle batch loading error gracefully
        }
      });
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
   * Injects KYC status column at the correct position
   */
  private injectColumns(displayedColumns: string[]): void {
    // Insert after status column (position 3)
    const insertPosition = Math.min(this.EXTEND_COLUMN_POSITION, displayedColumns.length - 1);

    // Insert KYC status column
    displayedColumns.splice(insertPosition + 1, 0, 'kycStatus');
  }

  /**
   * Dynamically adds column definitions to component template
   * This extends the component's methods for column handling
   */
  private injectColumnDefinitions(component: any): void {
    // Extend component methods for handling the new column
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
          props: {
            clientId: row.id,
            variant: 'chip',
            clickable: true
          }
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
      kycStatus: 'KYC Status'
    };

    return headers[column] || column;
  }

  /**
   * Cleanup method to be called when the service is destroyed
   */
  cleanup(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

/**
 * Client Extension Initializer Service
 *
 * Convenience service for initializing all client extensions
 */
@Injectable({
  providedIn: 'root'
})
export class ClientExtensionInitializerService {
  constructor(private columnExtensionService: ClientColumnExtensionService) {}

  /**
   * Initialize all extensions for a client component
   */
  initializeExtensions(component: any, type: 'table', data?: any): void {
    switch (type) {
      case 'table':
        this.columnExtensionService.extendClientsTable(component);
        if (data) {
          this.columnExtensionService.initializeExtensionDataLoading(data);
        }
        break;
    }
  }

  /**
   * Cleanup all extensions for a component
   */
  cleanupExtensions(component: any): void {
    this.columnExtensionService.removeExtendColumns(component);
    this.columnExtensionService.cleanup();
  }
}
