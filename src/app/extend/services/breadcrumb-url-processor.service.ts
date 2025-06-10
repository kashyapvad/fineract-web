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
import { Injectable } from '@angular/core';
import { Data } from '@angular/router';

/**
 * Interface for extend module configuration
 */
export interface ExtendModuleConfig {
  /** Module name identifier */
  name: string;
  /** URL path segments that identify this module */
  pathSegments: string[];
  /** Whether to remove /general suffix for this module */
  removeGeneralSuffix: boolean;
  /** Custom URL processing function (optional) */
  customProcessor?: (url: string, routeData: Data) => string;
}

/**
 * Breadcrumb URL Processor Service
 *
 * MINIMAL UPSTREAM INTEGRATION PATTERN:
 * - Provides extension point for breadcrumb URL processing
 * - Default implementation preserves existing behavior
 * - Extension implementations can override URL generation logic
 * - Single service injection enables comprehensive URL customization
 *
 * FORK-SAFE DESIGN:
 * - Service is optional and backwards compatible
 * - Default behavior unchanged if service not provided
 * - Extension logic completely separate from upstream code
 * - No breaking changes to existing breadcrumb functionality
 */
@Injectable({
  providedIn: 'root'
})
export class BreadcrumbUrlProcessorService {
  /**
   * Process breadcrumb URL after generation
   * Override this method in extension implementations
   */
  processUrl(url: string, routeData: Data, breadcrumbLabel: string): string {
    // Default implementation: preserve existing /general behavior for clients
    if (routeData.breadcrumb === 'Clients') {
      return this.addGeneralForClients(url);
    }
    return url;
  }

  /**
   * Default client URL processing (preserves existing behavior)
   */
  private addGeneralForClients(url: string): string {
    if (url && url.length > 8 && url.search('/clients/') > 0) {
      const replaceGeneral = '/general/';
      let currentUrlTemp = url.replace(replaceGeneral, '/');
      currentUrlTemp = currentUrlTemp.replace('//', '/');
      currentUrlTemp += '/general';
      const replaceDoubleSlash = '/general/general';
      currentUrlTemp = currentUrlTemp.replace(replaceDoubleSlash, '/general');
      return currentUrlTemp;
    }
    return url;
  }
}

/**
 * Extension Implementation
 * Override the default service to customize URL processing for extend modules only
 */
@Injectable({
  providedIn: 'root'
})
export class ExtendBreadcrumbUrlProcessorService extends BreadcrumbUrlProcessorService {
  /**
   * Registry of extend modules that require custom breadcrumb URL processing
   * This is the central place to configure all extend modules
   */
  private extendModules: ExtendModuleConfig[] = [
    {
      name: 'KYC',
      pathSegments: ['/kyc'],
      removeGeneralSuffix: true
    },
    {
      name: 'CreditBureau',
      pathSegments: ['/credit-report'],
      removeGeneralSuffix: true
    }
    // Future extend modules can be added here:
    // {
    //   name: 'Collateral',
    //   pathSegments: ['/collateral', '/collateral-management'],
    //   removeGeneralSuffix: true
    // },
    // {
    //   name: 'Reporting',
    //   pathSegments: ['/custom-reports'],
    //   removeGeneralSuffix: false,
    //   customProcessor: (url, routeData) => {
    //     // Custom processing for reporting module
    //     return url.replace('/reports/', '/custom-reports/');
    //   }
    // }
  ];

  /**
   * Extension URL processing - only affects extend module routes
   */
  override processUrl(url: string, routeData: Data, breadcrumbLabel: string): string {
    // Guard: Don't process empty, null, or root URLs
    if (!url || url === '/' || url === '') {
      return url;
    }

    // Check if this URL is handled by any extend module
    const extendModule = this.getExtendModuleForUrl(url);

    if (extendModule) {
      // This is an extend module route - apply custom processing
      return this.processExtendModuleUrl(url, routeData, extendModule);
    }

    // Not an extend module route - use default upstream behavior
    // This ensures all upstream routes remain unchanged
    return super.processUrl(url, routeData, breadcrumbLabel);
  }

  /**
   * Register a new extend module for breadcrumb processing
   * Allows dynamic registration of new modules
   */
  registerExtendModule(moduleConfig: ExtendModuleConfig): void {
    // Check if module already exists
    const existingIndex = this.extendModules.findIndex((m) => m.name === moduleConfig.name);

    if (existingIndex >= 0) {
      // Update existing module
      this.extendModules[existingIndex] = moduleConfig;
    } else {
      // Add new module
      this.extendModules.push(moduleConfig);
    }
  }

  /**
   * Get extend module configuration for a given URL
   */
  private getExtendModuleForUrl(url: string): ExtendModuleConfig | null {
    return this.extendModules.find((module) => module.pathSegments.some((segment) => url.includes(segment))) || null;
  }

  /**
   * Process URL for extend module routes
   */
  private processExtendModuleUrl(url: string, routeData: Data, moduleConfig: ExtendModuleConfig): string {
    let processedUrl = url;

    // Apply custom processor if defined
    if (moduleConfig.customProcessor) {
      processedUrl = moduleConfig.customProcessor(processedUrl, routeData);
    }

    // Apply standard processing rules
    if (moduleConfig.removeGeneralSuffix) {
      processedUrl = this.removeGeneralSuffix(processedUrl);
    }

    return processedUrl;
  }

  /**
   * Remove /general suffix from URLs for extend modules
   */
  private removeGeneralSuffix(url: string): string {
    let correctedUrl = url;

    if (url.endsWith('/general')) {
      correctedUrl = url.replace(/\/general$/, '');
    } else if (url.includes('/general/')) {
      correctedUrl = url.replace(/\/general\//, '/');
    }

    return correctedUrl.replace(/\/+/g, '/');
  }

  /**
   * Get all registered extend modules (for debugging/inspection)
   */
  getRegisteredModules(): ExtendModuleConfig[] {
    return [...this.extendModules];
  }
}
