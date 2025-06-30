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

/** Custom Modules */
import { GuarantorKycModule } from './guarantor-kyc.module';
import { GuarantorKycRoutingModule } from './guarantor-kyc-routing.module';

/**
 * Extend Guarantor KYC Routed Module
 *
 * This module provides lazy-loaded routing for the Guarantor KYC module
 * following the established pattern for client extensions in the Fineract web app.
 */
@NgModule({
  imports: [
    GuarantorKycModule,
    GuarantorKycRoutingModule
  ],
  exports: [
    GuarantorKycModule
  ]
})
export class ExtendGuarantorKycRoutedModule {}
