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
import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';

/**
 * Client Extensions Routes Configuration
 *
 * This module contains all custom client extension routes to minimize
 * changes to upstream client routing files. Import this configuration
 * in the main clients routing module.
 *
 * FORK STRATEGY: Keep all custom routes separate from upstream code
 * to simplify merging and reduce conflicts during upstream updates.
 */
export const clientExtensionsRoutes: Routes = [
  {
    path: 'kyc',
    data: { title: 'KYC', breadcrumb: 'KYC', routeParamBreadcrumb: false },
    loadChildren: () => import('./kyc/kyc-routed.module').then((m) => m.ExtendKycRoutedModule)
  },
  {
    path: 'credit-report',
    data: {
      title: 'Credit Report',
      breadcrumb: 'Credit Report',
      routeParamBreadcrumb: false
    },
    loadChildren: () => import('./credit-bureau/credit-bureau.module').then((m) => m.ExtendCreditBureauModule)
  }
];

/**
 * Client Extensions Routing Module
 *
 * Provides a centralized place for all client extension routes.
 * This approach keeps custom functionality separate from upstream code.
 */
@NgModule({})
export class ClientExtensionsRoutingModule {}
