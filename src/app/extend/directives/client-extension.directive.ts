/**
 * Client Extension Directive
 *
 * Single-line plugin architecture for extending client components
 * Usage: <mat-table [mifosxClientExtension]="'table'">
 */

/** Angular Imports */
import {
  Directive,
  Input,
  OnInit,
  OnDestroy,
  ElementRef,
  Renderer2,
  AfterViewInit,
  ComponentFactoryResolver,
  ViewContainerRef,
  Injector,
  ApplicationRef,
  ChangeDetectorRef,
  Host,
  Optional
} from '@angular/core';
import { MatTable } from '@angular/material/table';

// Import the KYC badge component
import { KycStatusBadgeComponent } from '../kyc/components/kyc-status-badge/kyc-status-badge.component';

/**
 * Client Extension Directive - Single Line Plugin Architecture
 *
 * FORK-SAFE PLUGIN PATTERN:
 * - Zero upstream template modifications required
 * - Single attribute addition enables full functionality
 * - Dynamic column definition injection
 * - Automatic component extension
 * - Uses MutationObserver for proper timing with async data loading
 *
 * Usage Examples:
 * <mat-table [mifosxClientExtension]="'table'">                    // Adds KYC + Credit columns
 * <mat-card-title [mifosxClientExtension]="'infoBar'" [clientData]="data">  // Adds status badges
 */
@Directive({
  selector: '[mifosxClientExtension]'
})
export class ClientExtensionDirective implements OnInit, AfterViewInit, OnDestroy {
  @Input('mifosxClientExtension') extensionType: 'table' | 'infoBar' = 'table';
  @Input() clientData: any;

  private extensionsApplied = false;
  private mutationObserver: MutationObserver | null = null;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private componentFactoryResolver: ComponentFactoryResolver,
    private viewContainerRef: ViewContainerRef,
    private injector: Injector,
    private applicationRef: ApplicationRef,
    private cdr: ChangeDetectorRef,
    @Host() @Optional() private matTable: MatTable<any>
  ) {}

  ngOnInit(): void {
    // Initialize table extensions with proper timing
    if (this.extensionType === 'table') {
      this.setupTableObserver();
    }
  }

  ngAfterViewInit(): void {
    // Initialize info bar extensions after view is stable
    if (this.extensionType === 'infoBar' && this.clientData) {
      // Use setTimeout to ensure we're outside the current change detection cycle
      setTimeout(() => {
        this.initializeInfoBarExtension();
      }, 0);
    }
  }

  ngOnDestroy(): void {
    // Cleanup component references and subscriptions
    this.cleanup();
  }

  private cleanup(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
  }

  /**
   * Sets up MutationObserver to watch for table row changes
   * This ensures extensions are applied when data is actually loaded
   */
  private setupTableObserver(): void {
    const tableElement = this.elementRef.nativeElement;

    // Create mutation observer to watch for table changes
    this.mutationObserver = new MutationObserver((mutations) => {
      let shouldApplyExtensions = false;

      mutations.forEach((mutation) => {
        // Check if new nodes were added
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if any added nodes are table rows
          Array.from(mutation.addedNodes).forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.classList.contains('mat-row') || element.classList.contains('mat-header-row')) {
                shouldApplyExtensions = true;
              }
            }
          });
        }
      });

      if (shouldApplyExtensions && !this.extensionsApplied) {
        // Use setTimeout to ensure DOM is stable
        setTimeout(() => {
          this.initializeTableExtension();
        }, 100);
      }
    });

    // Start observing the table for changes
    this.mutationObserver.observe(tableElement, {
      childList: true,
      subtree: true
    });

    // Also try to apply immediately in case rows already exist
    setTimeout(() => {
      if (!this.extensionsApplied) {
        this.initializeTableExtension();
      }
    }, 500);
  }

  /**
   * PLUGIN ARCHITECTURE: Table Extension
   * Adds KYC status column to existing table rows without modifying displayedColumns
   */
  private initializeTableExtension(): void {
    if (this.extensionsApplied) return;

    try {
      const tableElement = this.elementRef.nativeElement;

      // Add KYC header to existing header row
      this.addKycHeader(tableElement);

      // Add KYC cells to existing data rows
      this.addKycCellsToRows(tableElement);

      this.extensionsApplied = true;
    } catch (error) {
      // Extension failed silently to avoid breaking the main table functionality
    }
  }

  /**
   * PLUGIN ARCHITECTURE: Info Bar Extension
   * Dynamically injects status badges into client info bar
   */
  private initializeInfoBarExtension(): void {
    if (this.extensionsApplied) return;

    try {
      const infoBarElement = this.elementRef.nativeElement;

      // Find the entity name element to inject badge after it
      const entityNameElement = infoBarElement.querySelector('mifosx-entity-name');
      if (entityNameElement && this.clientData?.id) {
        this.createKycBadge(entityNameElement);
        this.extensionsApplied = true;
      }
    } catch (error) {
      // Extension failed silently to avoid breaking the info bar
    }
  }

  /**
   * Adds KYC header to the table header row
   */
  private addKycHeader(tableElement: Element): void {
    const headerRow = tableElement.querySelector('tr.mat-header-row');

    if (!headerRow) {
      return;
    }

    // Check if KYC header already exists
    if (headerRow.querySelector('.kyc-header-cell')) {
      return;
    }

    // Create KYC header cell
    const kycHeaderCell = this.renderer.createElement('th');
    this.renderer.addClass(kycHeaderCell, 'mat-header-cell');
    this.renderer.addClass(kycHeaderCell, 'kyc-header-cell');
    this.renderer.setStyle(kycHeaderCell, 'padding', '12px');
    this.renderer.setStyle(kycHeaderCell, 'text-align', 'left');

    const headerText = this.renderer.createText('KYC Status');
    this.renderer.appendChild(kycHeaderCell, headerText);

    // Insert before the last header cell (Office Name)
    const lastHeaderCell = headerRow.lastElementChild;
    if (lastHeaderCell) {
      this.renderer.insertBefore(headerRow, kycHeaderCell, lastHeaderCell);
    } else {
      this.renderer.appendChild(headerRow, kycHeaderCell);
    }
  }

  /**
   * Adds KYC cells to all existing data rows
   */
  private addKycCellsToRows(tableElement: Element): void {
    const dataRows = tableElement.querySelectorAll('tr.mat-row');

    // Try to get the table data from the MatTable component
    const tableData = this.getTableData();

    Array.from(dataRows).forEach((row, index) => {
      // Check if KYC cell already exists
      if (row.querySelector('.kyc-data-cell')) {
        return;
      }

      // Create KYC data cell
      const kycDataCell = this.renderer.createElement('td');
      this.renderer.addClass(kycDataCell, 'mat-cell');
      this.renderer.addClass(kycDataCell, 'kyc-data-cell');
      this.renderer.setStyle(kycDataCell, 'padding', '12px');

      // Get client ID from table data using row index
      const clientId = tableData && tableData[index] ? tableData[index].id : null;

      if (clientId) {
        // Create KYC badge component with proper timing
        this.createKycBadgeForTable(kycDataCell, clientId);
      } else {
        // Fallback: show placeholder
        const placeholder = this.renderer.createText('N/A');
        this.renderer.appendChild(kycDataCell, placeholder);
      }

      // Insert before the last cell (Office Name)
      const lastDataCell = row.lastElementChild;
      if (lastDataCell) {
        this.renderer.insertBefore(row, kycDataCell, lastDataCell);
      } else {
        this.renderer.appendChild(row, kycDataCell);
      }
    });
  }

  /**
   * Gets table data from the MatTable component
   * FORK-SAFE: Uses dependency injection to access MatTable without upstream modifications
   */
  private getTableData(): any[] | null {
    try {
      // First priority: use the injected MatTable instance
      if (this.matTable && this.matTable.dataSource) {
        const dataSource = this.matTable.dataSource;

        // Handle MatTableDataSource
        if (dataSource && typeof dataSource === 'object' && 'data' in dataSource) {
          return (dataSource as any).data || [];
        }

        // Handle direct array
        if (Array.isArray(dataSource)) {
          return dataSource;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Creates KYC badge component for table cells with proper change detection
   */
  private createKycBadgeForTable(kycDataCell: Element, clientId: number): void {
    try {
      // Create KYC badge component
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(KycStatusBadgeComponent);
      const componentRef = this.viewContainerRef.createComponent(componentFactory);

      // Set component inputs BEFORE attaching to DOM
      const instance = componentRef.instance as KycStatusBadgeComponent;
      instance.clientId = clientId;
      instance.variant = 'chip';
      instance.clickable = true;

      // Ensure change detection processes the component properly
      componentRef.changeDetectorRef.detectChanges();

      // Append the component's host element to the cell
      this.renderer.appendChild(kycDataCell, componentRef.location.nativeElement);
    } catch (error) {
      // Fallback: show placeholder if component creation fails
      const placeholder = this.renderer.createText('KYC N/A');
      this.renderer.appendChild(kycDataCell, placeholder);
    }
  }

  /**
   * DYNAMIC COMPONENT CREATION: KYC Badge for Info Bar
   * Creates KYC status badge component and injects it into info bar
   */
  private createKycBadge(entityNameElement: Element): void {
    try {
      // Create badge container
      const badgeContainer = this.renderer.createElement('div');
      this.renderer.addClass(badgeContainer, 'kyc-badge-container');
      this.renderer.setStyle(badgeContainer, 'display', 'inline-block');
      this.renderer.setStyle(badgeContainer, 'margin-left', '8px');

      // Create KYC badge component
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(KycStatusBadgeComponent);
      const componentRef = this.viewContainerRef.createComponent(componentFactory);

      // Set component inputs BEFORE attaching to DOM
      const instance = componentRef.instance as KycStatusBadgeComponent;
      instance.clientId = this.clientData.id;
      instance.variant = 'simple';
      instance.clickable = true;

      // Ensure change detection processes the component properly
      componentRef.changeDetectorRef.detectChanges();

      // Append the component's host element to the container
      this.renderer.appendChild(badgeContainer, componentRef.location.nativeElement);

      // Insert the badge container after the entity name element
      const parentElement = entityNameElement.parentElement;
      if (parentElement) {
        this.renderer.insertBefore(parentElement, badgeContainer, entityNameElement.nextSibling);
      }
    } catch (error) {
      // Badge creation failed silently to avoid breaking the info bar
    }
  }
}
