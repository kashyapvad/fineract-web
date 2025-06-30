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

import { Injectable } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AccountsFilterPipe } from 'app/pipes/accounts-filter.pipe';
import { GuarantorColumnExtensionService } from './guarantor-column-extension.service';

/**
 * Guarantor View Extension Service
 *
 * This service follows the Fork Safety Pattern by providing non-invasive
 * runtime extensions to the guarantor view component. All extension logic
 * is contained within this service, minimizing upstream modifications.
 *
 * Key Features:
 * - Dynamic column injection
 * - Data source management
 * - Extension data loading
 * - Method enhancement
 *
 * This approach ensures:
 * - Minimal upstream changes (only 2-3 lines in component)
 * - All extension logic in extend folder
 * - Maintainable and testable code
 * - Fork-safe architecture
 */
@Injectable({
  providedIn: 'root'
})
export class GuarantorViewExtensionService {
  constructor(
    private columnExtensionService: GuarantorColumnExtensionService,
    private accountsFilterPipe: AccountsFilterPipe
  ) {}

  /**
   * Initialize guarantor view extensions
   * Following the client extension pattern
   */
  initializeGuarantorView(component: any): void {
    // Extend columns array
    component.guarantorsDisplayedColumns = this.columnExtensionService.extendColumns(
      component.guarantorsDisplayedColumns
    );

    // Initialize data loading for extensions
    if (component.guarantorDetails && component.guarantorDetails.length > 0) {
      this.columnExtensionService.initializeExtensionDataLoading(component.guarantorDetails);
    }

    // Add MatTableDataSource for advanced filtering
    this.setupDataSource(component);

    // Enhance toggle method to work with extensions
    this.enhanceToggleMethod(component);
  }

  /**
   * Setup data source for the component
   */
  private setupDataSource(component: any): void {
    if (!component.dataSource) {
      component.dataSource = new MatTableDataSource([]);
    }

    // Initial data source update
    this.updateDataSource(component);
  }

  /**
   * Update data source with filtered data
   */
  private updateDataSource(component: any): void {
    if (!component.dataSource) return;

    // Apply the accounts filter pipe
    const filteredData = this.accountsFilterPipe.transform(
      component.guarantorDetails || [],
      'guarantor',
      component.showDeletedGuarantorsAccounts,
      null
    );

    // Update MatTableDataSource with filtered data
    component.dataSource.data = filteredData || [];
  }

  /**
   * Enhance toggle method to work with extensions
   */
  private enhanceToggleMethod(component: any): void {
    const originalToggle = component.toggleGuarantorsDetailsOverview.bind(component);

    component.toggleGuarantorsDetailsOverview = () => {
      originalToggle();

      // Update data source when filter changes
      this.updateDataSource(component);
    };
  }

  /**
   * Get extended columns (delegate to column extension service)
   */
  extendColumns(originalColumns: string[]): string[] {
    return this.columnExtensionService.extendColumns(originalColumns);
  }
}
