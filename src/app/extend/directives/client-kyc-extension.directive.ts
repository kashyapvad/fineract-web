import { Directive, Input, TemplateRef, ViewContainerRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Client KYC Table Extension Directive
 *
 * Robust Angular-native structural directive for extending client tables
 * with KYC status columns. Uses proper Angular patterns instead of brittle
 * component manipulation.
 *
 * Usage:
 * <ng-container *mifosxClientKycExtension="clientData">
 *   <mifosx-kyc-status-badge [clientId]="clientData.id" variant="chip" [clickable]="true"></mifosx-kyc-status-badge>
 * </ng-container>
 *
 * Following Angular Architecture Patterns:
 * - Structural directive for conditional content projection
 * - Template-based rendering instead of component manipulation
 * - Proper Angular lifecycle management
 * - Fork-safe architecture with minimal upstream modifications
 */
@Directive({
  selector: '[mifosxClientKycExtension]'
})
export class ClientKycExtensionDirective implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  @Input() set mifosxClientKycExtension(clientData: any) {
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
