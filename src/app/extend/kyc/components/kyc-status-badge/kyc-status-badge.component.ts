import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClientKycStatusService, KycStatusInfo } from '../../services/client-kyc-status.service';

@Component({
  selector: 'mifosx-kyc-status-badge',
  templateUrl: './kyc-status-badge.component.html',
  styleUrls: ['./kyc-status-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KycStatusBadgeComponent implements OnInit, OnDestroy {
  @Input() clientId!: number;
  @Input() showDetails = false; // Show additional details like document count
  @Input() variant: 'chip' | 'simple' = 'chip'; // Display variant
  @Input() clickable = false; // Enable click navigation to KYC page

  kycStatus: KycStatusInfo | null = null;
  isLoading = false;
  private destroy$ = new Subject<void>();

  // Cache computed values to prevent expression changed errors
  private _badgeClass = 'kyc-unknown';
  private _badgeText = 'Unknown';
  private _badgeIcon = 'help';
  private _tooltipText = 'KYC status unknown';

  constructor(
    private kycStatusService: ClientKycStatusService,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    // Initialize with default stable values
    this.updateComputedValues();
  }

  ngOnInit(): void {
    if (this.clientId) {
      this.initializeKycStatus();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * SIMPLIFIED: Initialize KYC status - no API calls, purely reactive
   */
  private initializeKycStatus(): void {
    if (!this.clientId) return;

    // 1. Check cache immediately
    this.checkCacheAndUpdate();

    // 2. Listen for cache updates (data will be loaded by extension service)
    this.kycStatusService.batchLoadStatus$.pipe(takeUntil(this.destroy$)).subscribe((batchStatusMap) => {
      this.checkCacheAndUpdate();
    });

    // 3. Show loading state initially if no data
    if (!this.kycStatus) {
      this.isLoading = true;
      this.updateComputedValues();
      this.cdr.markForCheck();

      // 4. Fallback timeout - if no data after 5 seconds, show "Unknown"
      timer(5000)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          if (!this.kycStatus && this.isLoading) {
            this.showUnknownStatus();
          }
        });
    }
  }

  /**
   * Check cache and update component state
   */
  private checkCacheAndUpdate(): void {
    const cachedStatus = this.kycStatusService.getKycStatusFromCache(this.clientId);
    if (cachedStatus && (!this.kycStatus || JSON.stringify(this.kycStatus) !== JSON.stringify(cachedStatus))) {
      this.kycStatus = cachedStatus;
      this.isLoading = false;
      this.updateComputedValues();
      this.cdr.markForCheck();
    }
  }

  /**
   * Show unknown status (fallback)
   */
  private showUnknownStatus(): void {
    this.kycStatus = {
      isVerified: false,
      verifiedDocumentCount: 0,
      totalRequiredDocuments: 2,
      hasRequiredDocuments: false
    };
    this.isLoading = false;
    this.updateComputedValues();
    this.cdr.markForCheck();
  }

  private updateComputedValues(): void {
    this._badgeClass = this.computeBadgeClass();
    this._badgeText = this.computeBadgeText();
    this._badgeIcon = this.computeBadgeIcon();
    this._tooltipText = this.computeTooltipText();
  }

  get badgeClass(): string {
    return this._badgeClass;
  }

  get badgeText(): string {
    return this._badgeText;
  }

  get badgeIcon(): string {
    return this._badgeIcon;
  }

  get tooltipText(): string {
    return this._tooltipText;
  }

  get showChipVariant(): boolean {
    return this.variant === 'chip';
  }

  get showSimpleVariant(): boolean {
    return this.variant === 'simple';
  }

  private computeBadgeClass(): string {
    if (this.isLoading) return 'kyc-loading';
    if (!this.kycStatus) return 'kyc-unknown';
    return this.kycStatus.isVerified ? 'kyc-verified' : 'kyc-pending';
  }

  private computeBadgeText(): string {
    if (this.isLoading) return 'Loading...';
    if (!this.kycStatus) return 'Unknown';

    if (this.showDetails) {
      const count = this.kycStatus.verifiedDocumentCount;
      return this.kycStatus.isVerified
        ? `KYC Verified (${count} docs)`
        : `KYC Pending (${count}/${this.kycStatus.totalRequiredDocuments})`;
    }

    return this.kycStatus.isVerified ? 'KYC Verified' : 'KYC Pending';
  }

  private computeBadgeIcon(): string {
    if (this.isLoading) return 'sync';
    if (!this.kycStatus) return 'help';
    return this.kycStatus.isVerified ? 'verified_user' : 'schedule';
  }

  private computeTooltipText(): string {
    if (this.isLoading) return 'Loading KYC status...';
    if (!this.kycStatus) return 'KYC status unknown';

    if (this.kycStatus.isVerified) {
      const dateText = this.kycStatus.lastVerifiedOn
        ? this.datePipe.transform(this.kycStatus.lastVerifiedOn, 'mediumDate')
        : 'recently';
      return `KYC verified with PAN and Aadhaar documents. Last verified: ${dateText}`;
    } else {
      return 'KYC verification pending. PAN and Aadhaar documents required for full verification.';
    }
  }

  /**
   * Navigate to KYC page for the client
   * Following Angular Architecture KB routing patterns
   */
  navigateToKyc(): void {
    if (!this.clickable || !this.clientId) {
      return;
    }

    // Navigate to client KYC page using the established routing structure
    this.router.navigate([
      '/clients',
      this.clientId,
      'kyc'
    ]);
  }

  /**
   * Handle keyboard navigation for accessibility
   * Following WCAG 2.1 AA compliance patterns
   */
  onKeyDown(event: KeyboardEvent): void {
    if (!this.clickable) {
      return;
    }

    // Handle Enter and Space key for accessibility
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.navigateToKyc();
    }
  }
}
