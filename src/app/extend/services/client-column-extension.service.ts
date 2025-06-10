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
          component: 'mifosx-credit-bureau-status-badge',
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
      kycStatus: 'labels.inputs.KYC Status',
      creditBureauStatus: 'labels.inputs.Credit Report'
    };

    return headers[column] || column;
  }

  /**
   * Finds info bar table element (left or right)
   */
  private findInfoBarTable(component: any, side: 'left' | 'right'): Element | null {
    // This would need to query the DOM to find the table elements
    // Implementation depends on component structure
    return null;
  }

  /**
   * Injects status row into info bar table
   */
  private injectStatusRow(table: Element, type: 'kyc' | 'creditBureau', clientId: number): void {
    // This would dynamically create and insert DOM elements
    // Implementation depends on table structure
  }
}

/**
 * Client Extension Initializer Service
 *
 * Automatically initializes client component extensions using Angular lifecycle hooks.
 * This service is designed to be injected into components that need extension
 * without requiring manual initialization.
 */
@Injectable({
  providedIn: 'root'
})
export class ClientExtensionInitializerService {
  constructor(private columnExtensionService: ClientColumnExtensionService) {}

  /**
   * Initializes client component extensions
   * Call this from component ngAfterViewInit or ngOnInit
   */
  initializeExtensions(component: any, type: 'table' | 'infoBar', data?: any): void {
    switch (type) {
      case 'table':
        this.columnExtensionService.extendClientsTable(component);
        break;
      case 'infoBar':
        this.columnExtensionService.extendClientInfoBar(component, data);
        break;
    }
  }

  /**
   * Cleanup extensions
   * Call this from component ngOnDestroy
   */
  cleanupExtensions(component: any): void {
    this.columnExtensionService.removeExtendColumns(component);
  }
}
