import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

// Extension Directives
import { ClientKycExtensionDirective } from './directives/client-kyc-extension.directive';
import { ClientInfoKycExtensionDirective } from './directives/client-info-kyc-extension.directive';

// Extension Components
import { ClientExtendedMenuComponent } from './components/client-extended-menu.component';

// KYC Module for badge component
import { ExtendKycModule } from './kyc/kyc.module';

// Loan EIR Module for EIR calculation and KFS generation
import { LoanEirModule } from './loan-eir/loan-eir.module';

// Services
import { ClientExtendActionsService } from './services/client-extend-actions.service';
import {
  BreadcrumbUrlProcessorService,
  ExtendBreadcrumbUrlProcessorService
} from './services/breadcrumb-url-processor.service';

/**
 * Extend Shared Module
 *
 * Consolidated module that provides all extension functionality
 * for integration with upstream components. This reduces the need
 * for multiple module imports and follows fork-safe patterns.
 *
 * Following fork-safe patterns from kb_critical.md
 */
@NgModule({
  declarations: [
    ClientKycExtensionDirective,
    ClientInfoKycExtensionDirective,
    ClientExtendedMenuComponent
  ],
  imports: [
    CommonModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
    ExtendKycModule,
    LoanEirModule
  ],
  exports: [
    ClientKycExtensionDirective,
    ClientInfoKycExtensionDirective,
    ClientExtendedMenuComponent,
    ExtendKycModule,
    LoanEirModule
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
export class ExtendSharedModule {}
