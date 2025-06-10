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
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

/** Angular Material Imports */
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

/** Shared Imports */
import { SharedModule } from '../../shared/shared.module';

/** KYC Components */
import { ViewKycActionComponent } from './components/view-kyc-action/view-kyc-action.component';
import { KycVerificationDialogComponent } from './components/kyc-verification-dialog/kyc-verification-dialog.component';
import { KycStatusBadgeComponent } from './components/kyc-status-badge/kyc-status-badge.component';

/**
 * Extend KYC Module
 *
 * Feature module for KYC functionality following Angular Architecture KB:
 * - Self-contained module with clear boundaries
 * - Proper service scoping at feature level
 * - Organized component structure for maintainability
 */
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTabsModule,
    MatTooltipModule
  ],
  declarations: [
    ViewKycActionComponent,
    KycVerificationDialogComponent,
    KycStatusBadgeComponent
  ],
  exports: [
    ViewKycActionComponent,
    KycStatusBadgeComponent
  ],
  providers: [
    DatePipe
  ]
})
export class ExtendKycModule {}
