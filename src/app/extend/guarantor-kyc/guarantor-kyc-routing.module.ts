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
import { Routes, RouterModule } from '@angular/router';

/** Custom Components */
import { GuarantorKycListComponent } from './components/guarantor-kyc-list/guarantor-kyc-list.component';
import { GuarantorKycFormComponent } from './components/guarantor-kyc-form/guarantor-kyc-form.component';
import { GuarantorKycViewComponent } from './components/guarantor-kyc-view/guarantor-kyc-view.component';

/** Guards */
// import { GuarantorKycResolverService } from './services/guarantor-kyc-resolver.service';

/**
 * Guarantor KYC Routing Configuration
 *
 * Defines routes for guarantor KYC management:
 * - List all guarantors for a client
 * - Create new guarantor KYC
 * - Edit existing guarantor KYC
 * - View guarantor KYC details with verification options
 */
const routes: Routes = [
  {
    path: '',
    data: { title: 'Guarantor KYC', breadcrumb: 'Guarantor KYC', routeParamBreadcrumb: false },
    component: GuarantorKycListComponent
  },
  {
    path: 'create',
    data: { title: 'Create Guarantor KYC', breadcrumb: 'Create', routeParamBreadcrumb: false },
    component: GuarantorKycFormComponent
  },
  {
    path: ':guarantorKycId',
    data: { title: 'View Guarantor KYC', breadcrumb: 'View', routeParamBreadcrumb: 'guarantorKycId' },
    component: GuarantorKycViewComponent
    // resolve: { guarantorKycData: GuarantorKycResolverService }
  },
  {
    path: ':guarantorKycId/edit',
    data: { title: 'Edit Guarantor KYC', breadcrumb: 'Edit', routeParamBreadcrumb: false },
    component: GuarantorKycFormComponent
    // resolve: { guarantorKycData: GuarantorKycResolverService }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GuarantorKycRoutingModule {}
