import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material Modules
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

// FontAwesome Module (if used in the project)
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// Components
import { KfsModalComponent } from './components/kfs-modal/kfs-modal.component';
import { LoanEirMenuItemsComponent } from './components/loan-eir-menu-items.component';

// Directives
import { LoanEirMenuExtensionDirective } from './directives/loan-eir-menu-extension.directive';

// Services
import { EirCalculatorService } from './services/eir-calculator.service';
import { KfsTemplateService } from './services/kfs-template.service';

/**
 * Loan EIR Module
 *
 * Provides EIR (Effective Interest Rate) calculation and KFS (Key Fact Sheet)
 * generation functionality for loan accounts following RBI guidelines.
 *
 * Features:
 * - EIR calculation using RBI IRR method
 * - KFS template upload and management
 * - Document generation and export (PDF/DOCX)
 * - Integration with loan repayment schedule
 * - Fork-safe extension patterns
 */
@NgModule({
  declarations: [
    // Components
    KfsModalComponent,
    LoanEirMenuItemsComponent,

    // Directives
    LoanEirMenuExtensionDirective
  ],
  imports: [
    // Angular Core
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    // Angular Material
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    MatDividerModule,
    MatMenuModule,
    MatTooltipModule,

    // FontAwesome
    FontAwesomeModule
  ],
  exports: [
    // Export directive for use in loan components
    LoanEirMenuExtensionDirective,

    // Export components
    KfsModalComponent,
    LoanEirMenuItemsComponent
  ],
  providers: [
    // Services with 'providedIn: root' are automatically available
    // But we can also provide them here for clarity
    EirCalculatorService,
    KfsTemplateService
  ]
})
export class LoanEirModule {}
