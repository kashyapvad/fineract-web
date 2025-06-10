import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  Input,
  ComponentFactoryResolver,
  ViewContainerRef,
  Renderer2
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KycStatusBadgeComponent } from '../kyc/components/kyc-status-badge/kyc-status-badge.component';

/**
 * Extension directive for adding KYC status badge to client info bar
 * Following fork-safe pattern - no upstream modifications required
 */
@Directive({
  selector: '[mifosxClientInfoKycExtension]'
})
export class ClientInfoKycExtensionDirective implements OnInit, OnDestroy {
  @Input() appClientInfoKycExtension!: any; // Client data

  private destroy$ = new Subject<void>();
  private kycBadgeAdded = false;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private viewContainer: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  ngOnInit(): void {
    if (this.appClientInfoKycExtension?.id) {
      this.addKycBadge();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private addKycBadge(): void {
    if (this.kycBadgeAdded) return;

    try {
      // Find a good location to insert the badge
      const hostElement = this.elementRef.nativeElement;

      // Look for the client name specifically - the <b> tag containing "Client Name"
      const clientNameLabel = hostElement.querySelector('b');
      const entityNameElement = hostElement.querySelector('mifosx-entity-name');

      if (clientNameLabel && entityNameElement) {
        // Create KYC badge component
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(KycStatusBadgeComponent);
        const componentRef = this.viewContainer.createComponent(componentFactory);

        // Set component inputs
        componentRef.instance.clientId = this.appClientInfoKycExtension.id;
        componentRef.instance.variant = 'simple';
        componentRef.instance.showDetails = false;
        componentRef.instance.clickable = true;

        // Create container div for the badge
        const badgeContainer = this.renderer.createElement('div');
        this.renderer.addClass(badgeContainer, 'kyc-badge-wrapper');
        this.renderer.setStyle(badgeContainer, 'display', 'inline-block');
        this.renderer.setStyle(badgeContainer, 'margin-left', '8px');
        this.renderer.setStyle(badgeContainer, 'vertical-align', 'middle');

        // Append the component's host element to our container
        this.renderer.appendChild(badgeContainer, componentRef.location.nativeElement);

        // Insert the container right after the entity name element
        if (entityNameElement.parentNode) {
          this.renderer.insertBefore(entityNameElement.parentNode, badgeContainer, entityNameElement.nextSibling);
        }

        this.kycBadgeAdded = true;
      }
    } catch (error) {
      // Extension failed silently to avoid breaking the client info display
    }
  }
}
