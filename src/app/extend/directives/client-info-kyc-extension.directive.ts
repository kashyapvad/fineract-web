import { Directive, Input, TemplateRef, ViewContainerRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Client Info KYC Extension Directive
 *
 * Robust Angular-native structural directive for extending client info bars
 * with KYC status badges. Uses proper Angular patterns instead of brittle
 * DOM manipulation.
 *
 * Usage:
 * <ng-container *mifosxClientInfoKycExtension="clientData">
 *   <mifosx-kyc-status-badge [clientId]="clientData.id" variant="simple" [clickable]="true"></mifosx-kyc-status-badge>
 * </ng-container>
 *
 * Following Angular Architecture Patterns:
 * - Structural directive for conditional content projection
 * - Template-based rendering instead of DOM manipulation
 * - Proper Angular lifecycle management
 * - Fork-safe architecture with minimal upstream modifications
 */
@Directive({
  selector: '[mifosxClientInfoKycExtension]'
})
export class ClientInfoKycExtensionDirective implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  @Input() set mifosxClientInfoKycExtension(clientData: any) {
    this.viewContainer.clear();

    if (this.shouldShowKycExtension(clientData)) {
      this.viewContainer.createEmbeddedView(this.templateRef, {
        $implicit: clientData,
        clientData: clientData
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.viewContainer.clear();
  }

  private shouldShowKycExtension(clientData: any): boolean {
    return clientData && clientData.id && typeof clientData.id === 'number';
  }
}
