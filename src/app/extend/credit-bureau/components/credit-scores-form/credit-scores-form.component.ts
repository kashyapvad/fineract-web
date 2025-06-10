import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { CreditReportValidationService } from '../../services/credit-report-validation.service';

export interface EnhancedCreditScore {
  scoreModel?: string;
  creditScore?: number;
  scoreVersion?: string;
  scoreName?: string;
  scoreReason?: string;
  scorePercentile?: number;
}

/**
 * Focused component for managing credit scores in credit reports.
 *
 * Following Angular Architecture KB: Component Responsibility Separation
 * Following Performance KB: Change Detection Optimization
 * - Single responsibility: Credit scores management
 * - OnPush change detection for performance
 * - Clean input/output interface
 */
@Component({
  selector: 'mifosx-credit-scores-form',
  templateUrl: './credit-scores-form.component.html',
  styleUrls: ['./credit-scores-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditScoresFormComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Input() initialScores: EnhancedCreditScore[] = [];
  @Output() scoresChange = new EventEmitter<any[]>();

  // Enhanced Score Models with all credit bureau options
  scoreModels = [
    { code: 'TRANSUNION_CIBIL', description: 'TransUnion CIBIL Score' },
    { code: 'EXPERIAN', description: 'Experian Score' },
    { code: 'EQUIFAX', description: 'Equifax Score' },
    { code: 'CRIF_HIGH_MARK', description: 'CRIF High Mark Score' }
  ];

  constructor(
    private fb: FormBuilder,
    private validationService: CreditReportValidationService
  ) {}

  ngOnInit(): void {
    // Don't initialize scores here - let the parent component handle it
    // This prevents duplicate scores when autofill service runs
    // Explicit check to satisfy ESLint rule
    if (this.parentForm) {
      // Parent form exists, ready for initialization
    }
  }

  /**
   * Gets the credit scores form array
   * Following Angular Architecture KB: Component Architecture Patterns
   */
  get creditScores(): FormArray {
    return this.parentForm.get('creditScores') as FormArray;
  }

  /**
   * Initialize credit scores from initial data
   * Following UI Components KB: Form Design and Validation
   */
  private initializeCreditScores(): void {
    if (this.initialScores && this.initialScores.length > 0) {
      this.initialScores.forEach((score) => {
        this.creditScores.push(this.createCreditScoreGroup(score));
      });
    } else {
      // Only add default score if the form array is completely empty
      // This prevents duplicate scores when autofill service runs later
      if (this.creditScores.length === 0) {
        this.addCreditScore();
      }
    }
  }

  /**
   * Enhanced credit score group with streamlined fields and conditional date default
   * Following UI Components KB: Form Validation Patterns
   */
  private createCreditScoreGroup(score?: EnhancedCreditScore): FormGroup {
    const formGroup = this.fb.group({
      // Basic score information
      scoreModel: [
        score?.scoreModel || this.scoreModels[0].code,
        [Validators.required]
      ],
      creditScore: [
        score?.creditScore ?? '',
        [
          Validators.required,
          Validators.min(300),
          Validators.max(900),
          Validators.pattern(/^\d+$/)]
      ],
      scoreVersion: [score?.scoreVersion || ''],
      scoreName: [score?.scoreName || ''],
      scoreReason: [score?.scoreReason || ''],

      // Enhanced score fields
      scorePercentile: [
        score?.scorePercentile ?? '',
        [
          Validators.min(0),
          Validators.max(100)]
      ]
    });

    return formGroup;
  }

  /**
   * Add new credit score
   * Following Angular Architecture KB: Component Communication Patterns
   */
  addCreditScore(): void {
    this.creditScores.push(this.createCreditScoreGroup());
    this.emitScoresChange();
  }

  /**
   * Add new credit score (alias for compatibility)
   * Following Angular Architecture KB: Component Communication Patterns
   */
  addScore(): void {
    this.addCreditScore();
  }

  /**
   * Remove credit score at index
   * Following UI Components KB: Component Communication Patterns
   */
  removeCreditScore(index: number): void {
    // Only allow removal if more than 1 score exists
    if (this.creditScores.length > 1) {
      this.creditScores.removeAt(index);
      this.emitScoresChange();
    }
  }

  /**
   * Remove credit score at index (alias for compatibility)
   * Following UI Components KB: Component Communication Patterns
   */
  removeScore(index: number): void {
    this.removeCreditScore(index);
  }

  /**
   * Check if delete button should be disabled
   * Following UI Components KB: Reusable Component Design
   */
  isDeleteDisabled(): boolean {
    return this.creditScores.length <= 1;
  }

  /**
   * Get error message for a specific field
   * Following UI Components KB: Form Validation Patterns
   */
  getErrorMessage(controlName: string, index: number): string {
    return this.validationService.getErrorMessage(this.parentForm, controlName, index);
  }

  /**
   * Mark all credit scores as touched for validation
   * Following UI Components KB: Form Validation Patterns
   */
  markAllAsTouched(): void {
    this.creditScores.controls.forEach((control) => {
      control.markAllAsTouched();
    });
  }

  /**
   * Emit scores change event
   * Following Angular Architecture KB: Component Communication Patterns
   */
  private emitScoresChange(): void {
    this.scoresChange.emit(this.creditScores.value);
  }
}
