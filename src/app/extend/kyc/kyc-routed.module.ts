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

/** Base KYC Module */
import { ExtendKycModule } from './kyc.module';

/** KYC Routing Module */
import { ExtendKycRoutingModule } from './kyc-routing.module';

/**
 * KYC Module with Routing
 *
 * This module combines the base KYC module with routing for lazy-loading contexts.
 * It should be used when the KYC module is lazy-loaded, while the base ExtendKycModule
 * can be used in shared contexts without routing conflicts.
 *
 * Following Angular Architecture KB patterns:
 * - Separation of concerns: base module vs routed module
 * - Lazy loading support with proper routing isolation
 * - Prevents routing conflicts in shared module contexts
 */
@NgModule({
  imports: [
    ExtendKycModule,
    ExtendKycRoutingModule
  ],
  exports: [
    ExtendKycModule
  ]
})
export class ExtendKycRoutedModule {}
