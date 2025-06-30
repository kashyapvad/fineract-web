import { NgModule } from '@angular/core';

// Extension Directives
import { ClientKycExtensionDirective } from './directives/client-kyc-extension.directive';
import { ClientInfoKycExtensionDirective } from './directives/client-info-kyc-extension.directive';
import { GuarantorKycExtensionDirective } from './directives/guarantor-kyc-extension.directive';
import { GuarantorTableExtensionDirective } from './directives/guarantor-table-extension.directive';
import { GuarantorFormExtensionDirective } from './directives/guarantor-form-extension.directive';

// Extension Components
import { ClientExtendedMenuComponent } from './components/client-extended-menu.component';

// KYC Module for badge component
import { ExtendKycModule } from './kyc/kyc.module';

// Guarantor KYC Module for guarantor badge component (without routing)
import { GuarantorKycModule } from './guarantor-kyc/guarantor-kyc.module';

// Loan EIR Module for EIR calculation and KFS generation
import { LoanEirModule } from './loan-eir/loan-eir.module';

// Services
import { ClientExtendActionsService } from './services/client-extend-actions.service';
import {
  BreadcrumbUrlProcessorService,
  ExtendBreadcrumbUrlProcessorService
} from './services/breadcrumb-url-processor.service';

/**
 * Extend Module
 *
 * Main extension module for traditional NgModule integration with upstream components.
 * Provides directives, services, and module exports in a clean, DRY manner.
 *
 * Purpose: Traditional NgModule pattern for upstream integration
 * Usage: Import this in upstream modules that need extension functionality
 */
@NgModule({
  imports: [
    // Feature Modules
    ExtendKycModule,
    GuarantorKycModule,
    LoanEirModule,

    // Extension Directives (standalone)
    ClientKycExtensionDirective,
    ClientInfoKycExtensionDirective,
    GuarantorKycExtensionDirective,
    GuarantorTableExtensionDirective,
    GuarantorFormExtensionDirective,

    // Extension Components (standalone)
    ClientExtendedMenuComponent
  ],
  exports: [
    // Feature Modules - for re-export
    ExtendKycModule,
    GuarantorKycModule,
    LoanEirModule,

    // Extension Directives - for upstream use
    ClientKycExtensionDirective,
    ClientInfoKycExtensionDirective,
    GuarantorKycExtensionDirective,
    GuarantorTableExtensionDirective,
    GuarantorFormExtensionDirective,

    // Extension Components - for upstream use
    ClientExtendedMenuComponent
  ],
  providers: [
    ClientExtendActionsService,
    // Override default breadcrumb URL processor with extension implementation
    {
      provide: BreadcrumbUrlProcessorService,
      useClass: ExtendBreadcrumbUrlProcessorService
    }
  ]
})
export class ExtendModule {}
