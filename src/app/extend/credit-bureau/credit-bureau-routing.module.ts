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
import { RouterModule, Routes } from '@angular/router';

/** Custom Components */
import { ViewCreditBureauActionComponent } from './components/view-credit-bureau-action/view-credit-bureau-action.component';
import { ViewCreditReportDetailsComponent } from './components/view-credit-report-details/view-credit-report-details.component';

/**
 * Credit Bureau routing configuration
 *
 * Following Angular Architecture KB routing patterns:
 * - Feature routing integrated with main application routing
 * - Proper route parameter handling
 * - Route data resolution before component activation
 */
const routes: Routes = [
  {
    path: '',
    component: ViewCreditBureauActionComponent,
    data: { title: 'Credit Report Management', breadcrumb: 'Credit Report Management' }
  },
  {
    path: 'reports/:reportId',
    component: ViewCreditReportDetailsComponent,
    data: {
      title: 'Credit Report Details',
      breadcrumb: 'Report Details',
      routeParamBreadcrumb: false
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExtendCreditBureauRoutingModule {}
