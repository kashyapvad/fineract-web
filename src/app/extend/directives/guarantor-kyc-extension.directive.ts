import { Directive, Input, TemplateRef, ViewContainerRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Guarantor KYC Extension Directive
 *
 * Angular-native structural directive for extending guarantor tables
 * with KYC status columns. Uses proper Angular patterns instead of brittle
 * DOM manipulation.
 *
 * Usage:
 * <ng-container *mifosxGuarantorKycExtension="guarantorData; clientId: clientId">
 *   <mifosx-guarantor-kyc-badge [guarantorData]="guarantorData" [clientId]="clientId" variant="chip" [clickable]="true"></mifosx-guarantor-kyc-badge>
 * </ng-container>
 *
 * Following Angular Architecture Patterns:
 * - Structural directive for conditional content projection
 * - Template-based rendering instead of component manipulation
 * - Proper Angular lifecycle management
 * - Fork-safe architecture with minimal upstream modifications
 */
@Directive({
  selector: '[mifosxGuarantorKycExtension]'
})
export class GuarantorKycExtensionDirective implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  @Input() set mifosxGuarantorKycExtension(guarantorData: any) {
    this.viewContainer.clear();

    if (this.shouldShowKycExtension(guarantorData)) {
      this.viewContainer.createEmbeddedView(this.templateRef, {
        $implicit: guarantorData,
        guarantorData: guarantorData
      });
    }
  }

  @Input() clientId: number;

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.viewContainer.clear();
  }

  private shouldShowKycExtension(guarantorData: any): boolean {
    // Show KYC badge for CUSTOMER (1) and GUARANTOR_KYC (4) types
    const guarantorType = guarantorData?.guarantorType?.id;
    return guarantorData && (guarantorType === 1 || guarantorType === 4);
  }
}
