import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Loan EIR Menu Extension Directive
 *
 * Robust Angular-native structural directive for extending loan action menus
 * with EIR/KFS functionality. Uses proper Angular patterns instead of brittle
 * DOM manipulation.
 *
 * Usage:
 * <ng-container *mifosxLoanEirExtension="loanData">
 *   <!-- EIR/KFS menu items will be rendered here -->
 * </ng-container>
 *
 * Following Angular Architecture Patterns:
 * - Structural directive for conditional content projection
 * - Template-based rendering instead of DOM manipulation
 * - Proper Angular lifecycle management
 * - Service layer abstraction for business logic
 */
@Directive({
  selector: '[mifosxLoanEirExtension]'
})
export class LoanEirMenuExtensionDirective implements OnInit, OnDestroy {
  @Input('mifosxLoanEirExtension') loanData: any;

  private destroy$ = new Subject<void>();
  private hasRendered = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.renderMenuItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.viewContainer.clear();
  }

  private renderMenuItems(): void {
    if (this.hasRendered) return;

    // Check if loan is eligible for EIR/KFS functionality
    if (this.shouldShowEirKfsOptions()) {
      // Create template context with loan data and helper methods
      const context = {
        $implicit: this.loanData,
        loanData: this.loanData,
        showCalculateEir: this.shouldShowCalculateEir(),
        showExportKfs: this.shouldShowExportKfs()
      };

      // Render the template with context
      this.viewContainer.createEmbeddedView(this.templateRef, context);
      this.hasRendered = true;
      this.cdr.markForCheck();
    }
  }

  private shouldShowEirKfsOptions(): boolean {
    if (!this.loanData?.status?.value) return false;

    // Only show EIR/KFS options for approved or active loans
    const eligibleStatuses = [
      'Active',
      'Approved'
    ];
    return eligibleStatuses.includes(this.loanData.status.value);
  }

  private shouldShowCalculateEir(): boolean {
    // Calculate EIR available for all eligible statuses (same as upload)
    return this.shouldShowEirKfsOptions();
  }

  private shouldShowExportKfs(): boolean {
    // Export KFS available for all eligible statuses (same as upload)
    return this.shouldShowEirKfsOptions();
  }
}
