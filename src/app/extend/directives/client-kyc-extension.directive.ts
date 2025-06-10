import { Directive, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Extension directive for adding KYC status column to clients table
 * Following fork-safe pattern - minimal upstream modifications required
 */
@Directive({
  selector: '[mifosxClientKycExtension]'
})
export class ClientKycExtensionDirective implements OnInit, OnDestroy {
  @Input() appClientKycExtension!: any; // ClientsComponent instance

  private destroy$ = new Subject<void>();
  private kycColumnAdded = false;

  constructor() {}

  ngOnInit(): void {
    if (this.appClientKycExtension) {
      this.addKycColumn();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private addKycColumn(): void {
    if (this.kycColumnAdded) return;

    try {
      const component = this.appClientKycExtension;

      // Add KYC column to displayed columns
      if (component.displayedColumns && Array.isArray(component.displayedColumns)) {
        // Insert KYC column after status column, or before last column if status not found
        const statusIndex = component.displayedColumns.indexOf('status');
        const insertIndex = statusIndex !== -1 ? statusIndex + 1 : component.displayedColumns.length - 1;

        // Only add if not already present
        if (!component.displayedColumns.includes('kycStatus')) {
          component.displayedColumns.splice(insertIndex, 0, 'kycStatus');
          this.kycColumnAdded = true;

          // Trigger change detection
          if (component.changeDetectorRef) {
            component.changeDetectorRef.detectChanges();
          }
        }
      }
    } catch (error) {
      // Extension failed silently to avoid breaking the main table functionality
    }
  }
}
