import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Extension Directives
import { ClientExtensionDirective } from './directives/client-extension.directive';
import { ClientExtendMenuDirective } from './directives/client-extend-menu.directive';
import { ClientKycExtensionDirective } from './directives/client-kyc-extension.directive';
import { ClientInfoKycExtensionDirective } from './directives/client-info-kyc-extension.directive';

// KYC Module for badge component
import { ExtendKycModule } from './kyc/kyc.module';

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
    ClientExtensionDirective,
    ClientExtendMenuDirective,
    ClientKycExtensionDirective,
    ClientInfoKycExtensionDirective
  ],
  imports: [
    CommonModule,
    ExtendKycModule
  ],
  exports: [
    ClientExtensionDirective,
    ClientExtendMenuDirective,
    ClientKycExtensionDirective,
    ClientInfoKycExtensionDirective,
    ExtendKycModule
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
