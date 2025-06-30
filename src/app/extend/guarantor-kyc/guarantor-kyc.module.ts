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
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

/** Material Imports */
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';

/** Custom Modules */
import { SharedModule } from 'app/shared/shared.module';
import { PipesModule } from 'app/pipes/pipes.module';
import { DirectivesModule } from 'app/directives/directives.module';
import { ExtendKycModule } from '../kyc/kyc.module';

/** Components */
import { GuarantorKycListComponent } from './components/guarantor-kyc-list/guarantor-kyc-list.component';
import { GuarantorKycFormComponent } from './components/guarantor-kyc-form/guarantor-kyc-form.component';
import { GuarantorKycViewComponent } from './components/guarantor-kyc-view/guarantor-kyc-view.component';
import { KycStatusBadgeComponent } from '../components/kyc-status-badge.component';

/**
 * Guarantor KYC Module
 *
 * Provides comprehensive KYC management for guarantors including:
 * - Guarantor personal information management
 * - KYC document verification (PAN, Aadhaar)
 * - Manual, API, and OTP-based verification workflows
 * - Address and relationship information management
 *
 * This module follows the DRY principle by reusing the KYC verification dialog
 * components instead of duplicating functionality.
 */
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTableModule,
    MatTooltipModule,
    MatMenuModule,
    MatCheckboxModule,
    MatDividerModule,
    MatExpansionModule,
    MatTabsModule,
    MatChipsModule,
    SharedModule,
    PipesModule,
    DirectivesModule,
    ExtendKycModule,
    GuarantorKycListComponent,
    GuarantorKycFormComponent,
    GuarantorKycViewComponent,
    KycStatusBadgeComponent
  ],
  exports: [
    KycStatusBadgeComponent
  ]
})
export class GuarantorKycModule {}
