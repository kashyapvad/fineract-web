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
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

/** Material Imports */
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

/** Routing Module */
import { ExtendCreditBureauRoutingModule } from './credit-bureau-routing.module';

/** Components */
import { ViewCreditBureauActionComponent } from './components/view-credit-bureau-action/view-credit-bureau-action.component';
import { ViewCreditReportDetailsComponent } from './components/view-credit-report-details/view-credit-report-details.component';
import { PullCreditReportDialogComponent } from './components/pull-credit-report-dialog/pull-credit-report-dialog.component';
import { CreateCreditReportDialogComponent } from './components/create-credit-report-dialog/create-credit-report-dialog.component';
import { EditCreditReportDialogComponent } from './components/edit-credit-report-dialog/edit-credit-report-dialog.component';
import { SharedCreditReportFormComponent } from './components/shared-credit-report-form/shared-credit-report-form.component';

/** Focused Form Components - Following Angular Architecture KB: Component Responsibility Separation */
import { CreditScoresFormComponent } from './components/credit-scores-form/credit-scores-form.component';
import { CustomerInfoFormComponent } from './components/customer-info-form/customer-info-form.component';
import { FinancialInfoFormComponent } from './components/financial-info-form/financial-info-form.component';

/** Shared Components */
import { DeleteDialogComponent } from '../shared/delete-dialog/delete-dialog.component';

/**
 * Credit Bureau Feature Module
 *
 * Provides comprehensive credit bureau management functionality.
 * Following Angular Architecture KB patterns:
 * - Feature module isolation with clear boundaries
 * - Lazy loading support for performance optimization
 * - Material Design component integration
 * - Reactive forms for user input handling
 */
@NgModule({
  declarations: [
    // Main Components
    ViewCreditBureauActionComponent,
    ViewCreditReportDetailsComponent,

    // Dialog Components
    PullCreditReportDialogComponent,
    CreateCreditReportDialogComponent,
    EditCreditReportDialogComponent,

    // Form Components
    SharedCreditReportFormComponent,

    // Focused Form Components - Following Angular Architecture KB: Component Responsibility Separation
    CreditScoresFormComponent,
    CustomerInfoFormComponent,
    FinancialInfoFormComponent,

    // Shared Components
    DeleteDialogComponent
  ],
  imports: [
    // Angular Core
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,

    // Routing
    ExtendCreditBureauRoutingModule,

    // Material Design Components
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
    MatTooltipModule,
    MatChipsModule,
    MatBadgeModule,
    MatTabsModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    // Services are provided in root via @Injectable({ providedIn: 'root' })
    DatePipe
  ]
})
export class ExtendCreditBureauModule {}
