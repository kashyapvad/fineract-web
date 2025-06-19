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
    // Initialize credit scores from initial data when component loads
    this.initializeCreditScores();
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
    // Clear existing scores first to avoid duplicates
    while (this.creditScores.length > 0) {
      this.creditScores.removeAt(0);
    }

    if (this.initialScores && this.initialScores.length > 0) {
      this.initialScores.forEach((score) => {
        this.creditScores.push(this.createCreditScoreGroup(score));
      });
    } else {
      // Add one default score if no initial scores provided
      this.addCreditScore();
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

    // Add valueChanges listener to revalidate other score models when this one changes
    const scoreModelControl = formGroup.get('scoreModel');
    scoreModelControl?.valueChanges.subscribe(() => {
      setTimeout(() => this.revalidateAllScoreModels(), 0);
    });

    return formGroup;
  }

  /**
   * Add new credit score
   * Following Angular Architecture KB: Component Architecture Patterns
   */
  addCreditScore(): void {
    this.creditScores.push(this.createCreditScoreGroup());
    this.emitScoresChange();
    // Revalidate all score models after adding
    setTimeout(() => this.revalidateAllScoreModels(), 0);
  }

  /**
   * Add new credit score (alias for compatibility)
   * Following Angular Architecture KB: Component Communication Patterns
   */
  addScore(): void {
    this.addCreditScore();
  }

  /**
   * Remove credit score by index
   * Following Angular Architecture KB: Component Architecture Patterns
   */
  removeCreditScore(index: number): void {
    if (this.creditScores.length > 1) {
      this.creditScores.removeAt(index);
      this.emitScoresChange();
      // Revalidate all score models after removing
      setTimeout(() => this.revalidateAllScoreModels(), 0);
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
   * Custom validator to prevent duplicate score models
   * Following UI Components KB: Form Validation Patterns
   */
  private createDuplicateScoreModelValidator() {
    return (control: AbstractControl) => {
      if (!control.value || !this.creditScores) {
        return null;
      }

      const currentModel = control.value;
      const duplicateCount = this.creditScores.controls
        .map((group) => group.get('scoreModel')?.value)
        .filter((model) => model === currentModel).length;

      return duplicateCount > 1 ? { duplicateScoreModel: true } : null;
    };
  }

  /**
   * Revalidate all score model controls to update duplicate validation
   * Following Angular Architecture KB: Component Architecture Patterns
   */
  private revalidateAllScoreModels(): void {
    this.creditScores.controls.forEach((group) => {
      const scoreModelControl = group.get('scoreModel');
      if (scoreModelControl) {
        scoreModelControl.updateValueAndValidity({ emitEvent: false });
      }
    });
  }

  /**
   * Emit scores change event
   * Following Angular Architecture KB: Component Communication Patterns
   */
  private emitScoresChange(): void {
    this.scoresChange.emit(this.creditScores.value);
  }

  /**
   * Check if there are any duplicate score models
   * Following UI Components KB: Form Validation Patterns
   */
  hasDuplicateScoreModels(): boolean {
    const scoreModels = this.creditScores.controls
      .map((group) => group.get('scoreModel')?.value)
      .filter((model) => model); // Filter out empty values

    const uniqueModels = new Set(scoreModels);
    return scoreModels.length !== uniqueModels.size;
  }

  /**
   * Get duplicate score models
   * Following UI Components KB: Form Validation Patterns
   */
  getDuplicateScoreModels(): string[] {
    const scoreModels = this.creditScores.controls
      .map((group) => group.get('scoreModel')?.value)
      .filter((model) => model);

    const modelCounts = new Map<string, number>();
    scoreModels.forEach((model) => {
      modelCounts.set(model, (modelCounts.get(model) || 0) + 1);
    });

    return Array.from(modelCounts.entries())
      .filter(
        ([
          model,
          count
        ]) => count > 1
      )
      .map(
        ([
          model,
          count
        ]) => model
      );
  }

  /**
   * Check if a specific score model is duplicated
   * Following UI Components KB: Form Validation Patterns
   */
  isScoreModelDuplicated(index: number): boolean {
    const currentModel = this.creditScores.at(index).get('scoreModel')?.value;
    if (!currentModel) return false;

    const duplicateModels = this.getDuplicateScoreModels();
    return duplicateModels.includes(currentModel);
  }
}
