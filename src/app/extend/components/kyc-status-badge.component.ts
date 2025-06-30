import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClientKycStatusService, KycStatusInfo } from '../kyc/services/client-kyc-status.service';
import {
  GuarantorKycStatusService,
  GuarantorKycStatusInfo
} from '../guarantor-kyc/services/guarantor-kyc-status.service';

// Material Design Components - specific imports only for optimal tree-shaking
import { MatChip } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'mifosx-kyc-status-badge',
  templateUrl: './kyc-status-badge.component.html',
  styleUrls: ['./kyc-status-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    MatChip,
    MatIcon,
    MatTooltip
  ],
  providers: [DatePipe]
})
export class KycStatusBadgeComponent implements OnInit, OnDestroy {
  @Input() type: 'client' | 'guarantor' = 'client'; // KYC type
  @Input() clientId!: number; // Required for both types
  @Input() guarantorKycId?: number; // Required for guarantor type
  @Input() guarantorData?: any; // Optional guarantor data object
  @Input() showDetails = false; // Show additional details like document count
  @Input() variant: 'chip' | 'simple' = 'chip'; // Display variant
  @Input() clickable = false; // Enable click navigation to KYC page

  kycStatus: KycStatusInfo | GuarantorKycStatusInfo | null = null;
  isLoading = false;
  private destroy$ = new Subject<void>();

  // Cache computed values to prevent expression changed errors
  private _badgeClass = 'kyc-unknown';
  private _badgeText = 'Unknown';
  private _badgeIcon = 'help';
  private _tooltipText = 'KYC status unknown';

  constructor(
    private clientKycStatusService: ClientKycStatusService,
    private guarantorKycStatusService: GuarantorKycStatusService,
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
   * Get the appropriate service based on type
   */
  private getCurrentService(): ClientKycStatusService | GuarantorKycStatusService {
    return this.type === 'guarantor' ? this.guarantorKycStatusService : this.clientKycStatusService;
  }

  /**
   * SIMPLIFIED: Initialize KYC status - no API calls, purely reactive
   */
  private initializeKycStatus(): void {
    if (!this.clientId) return;

    // 1. Check cache immediately
    this.checkCacheAndUpdate();

    // 2. Listen for cache updates (data will be loaded by extension service)
    if (this.type === 'guarantor') {
      this.guarantorKycStatusService.statusUpdates$.pipe(takeUntil(this.destroy$)).subscribe((statusMap: any) => {
        this.checkCacheAndUpdate();
      });
    } else {
      this.clientKycStatusService.cacheUpdates$.pipe(takeUntil(this.destroy$)).subscribe((cacheStatusMap: any) => {
        this.checkCacheAndUpdate();
      });
    }

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
    let cachedStatus: any = null;

    if (this.type === 'guarantor' && this.guarantorKycId) {
      cachedStatus = this.guarantorKycStatusService.getGuarantorKycStatusFromCache(this.guarantorKycId);
    } else {
      cachedStatus = this.clientKycStatusService.getKycStatusFromCache(this.clientId);
    }

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
    if (this.type === 'guarantor') {
      this.kycStatus = {
        guarantorKycId: this.guarantorKycId || 0,
        clientId: this.clientId,
        isVerified: false,
        isFullyVerified: false,
        verifiedDocumentCount: 0,
        totalRequiredDocuments: 2,
        verificationMethod: null,
        lastVerifiedOn: null,
        verifiedByUsername: null,
        panVerified: false,
        aadhaarVerified: false,
        fullName: '',
        mobileNumber: '',
        relationshipToClient: ''
      };
    } else {
      this.kycStatus = {
        isVerified: false,
        verifiedDocumentCount: 0,
        totalRequiredDocuments: 2,
        hasRequiredDocuments: false
      };
    }
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

    const typeText = this.type === 'guarantor' ? 'Guarantor KYC' : 'KYC';

    if (this.kycStatus.isVerified) {
      const dateText = this.kycStatus.lastVerifiedOn
        ? this.datePipe.transform(this.kycStatus.lastVerifiedOn, 'mediumDate')
        : 'recently';
      return `${typeText} verified with PAN and Aadhaar documents. Last verified: ${dateText}`;
    } else {
      return `${typeText} verification pending. PAN and Aadhaar documents required for full verification.`;
    }
  }

  /**
   * Navigate to appropriate KYC page based on type
   * Following Angular Architecture KB routing patterns
   */
  navigateToKyc(): void {
    if (!this.clickable || !this.clientId) {
      return;
    }

    if (this.type === 'guarantor' && this.guarantorKycId) {
      // Navigate to guarantor KYC view page
      this.router.navigate([
        '/clients',
        this.clientId,
        'guarantor-kyc',
        this.guarantorKycId
      ]);
    } else {
      // Navigate to client KYC page using the established routing structure
      this.router.navigate([
        '/clients',
        this.clientId,
        'kyc'
      ]);
    }
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
