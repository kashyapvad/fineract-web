import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import {
  CreditBureauReport,
  CreateCreditReportRequest,
  UpdateCreditReportRequest,
  CreditScore
} from '../../services/client-credit-bureau.service';

/** Services - Following Angular Architecture KB: Service Responsibility Segregation */
import { CreditReportAutofillService } from '../../services/credit-report-autofill.service';
import { CreditReportValidationService } from '../../services/credit-report-validation.service';

/** Focused Components - Following Angular Architecture KB: Component Responsibility Separation */
import { CreditScoresFormComponent } from '../credit-scores-form/credit-scores-form.component';
import { CustomerInfoFormComponent } from '../customer-info-form/customer-info-form.component';
import { FinancialInfoFormComponent } from '../financial-info-form/financial-info-form.component';

/**
 * Enhanced Credit Score interface with streamlined fields
 */
export interface EnhancedCreditScore extends CreditScore {
  scorePercentile?: number;
}

/**
 * JSON Editor Section interface for dynamic section management
 */
export interface JsonEditorSection {
  id: string;
  name: string;
  description?: string;
  data: { [key: string]: any };
  isEditable: boolean;
}

/**
 * Refactored Shared Credit Report Form Component
 *
 * Following Angular Architecture KB: Component Responsibility Separation
 * Following UI Components KB: Reusable Component Design
 * Following State Management KB: Service-based state management
 *
 * This component now focuses solely on:
 * - Form orchestration and coordination
 * - Component communication
 * - User interaction handling
 * - Template binding
 *
 * Business logic delegated to:
 * - CreditReportAutofillService: Auto-fill and data loading logic
 * - CreditReportValidationService: Validation and error handling
 * - Focused components: Specific form sections
 */
@Component({
  selector: 'mifosx-shared-credit-report-form',
  templateUrl: './shared-credit-report-form.component.html',
  styleUrls: ['./shared-credit-report-form.component.scss']
})
export class SharedCreditReportFormComponent implements OnInit {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() clientId!: number;
  @Input() clientData?: any;
  @Input() clientIdentifiers?: any[];
  @Input() clientKycData?: any;
  @Input() clientAddresses?: any[];
  @Input() initialReport?: CreditBureauReport;

  @Output() formCancel = new EventEmitter<void>();
  @Output() formSubmit = new EventEmitter<CreateCreditReportRequest | UpdateCreditReportRequest>();

  form!: FormGroup;
  isSubmitting = false;
  isLoadingClientData = false;

  // JSON Editor state
  jsonSections: JsonEditorSection[] = [];
  activeJsonTab = 0;
  showJsonPreview = false;

  // ViewChild references for focused components
  @ViewChild(CreditScoresFormComponent) creditScoresComponent!: CreditScoresFormComponent;
  @ViewChild(CustomerInfoFormComponent) customerInfoComponent!: CustomerInfoFormComponent;
  @ViewChild(FinancialInfoFormComponent) financialInfoComponent!: FinancialInfoFormComponent;

  constructor(
    private fb: FormBuilder,
    private autofillService: CreditReportAutofillService,
    private validationService: CreditReportValidationService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.initializeJsonSections();

    if (this.mode === 'edit') {
      this.autoFillReportData();
    } else {
      this.loadClientDataAndAutoFill();
    }
  }

  /**
   * Initialize form structure - delegating validation to service
   */
  private initializeForm(): void {
    this.form = this.validationService.createCreditReportForm(this.initialReport);
  }

  /**
   * Load client data and auto-fill using autofill service
   */
  private loadClientDataAndAutoFill(): void {
    if (!this.clientId) {
      return;
    }

    this.isLoadingClientData = true;

    this.autofillService
      .autoFillForCreateMode(
        this.form,
        this.clientId,
        this.clientData,
        this.clientIdentifiers,
        this.clientKycData,
        this.clientAddresses
      )
      .subscribe({
        next: () => {
          this.isLoadingClientData = false;
        },
        error: (error) => {
          this.isLoadingClientData = false;
          console.error('Error loading client data:', error);
        }
      });
  }

  /**
   * Auto-fill for edit mode using autofill service
   * Following Angular Architecture KB: Service Responsibility Segregation
   */
  private autoFillReportData(): void {
    if (!this.initialReport) {
      return;
    }

    // First, fill from existing report data
    this.autofillService.autoFillForEditMode(this.form, this.initialReport);

    // Then, auto-fill any missing fields from client data (like Aadhaar, Mobile)
    // This ensures edit mode has the same comprehensive data as create mode
    if (this.clientId) {
      this.autofillService
        .autoFillMissingFields(this.form, this.clientId, this.clientData, this.clientKycData, this.clientAddresses)
        .subscribe({
          next: () => {
            // Missing fields auto-filled successfully
          },
          error: (error) => {
            console.error('Error auto-filling missing fields in edit mode:', error);
          }
        });
    }

    // Parse and populate JSON sections from additional data
    this.populateJsonSectionsFromAdditionalData();
  }

  /**
   * Initialize JSON sections for additional data
   * Following UI Components KB: Form Design and Validation
   */
  private initializeJsonSections(): void {
    // Start with empty sections array - no default sections
    // Users can add sections as needed
    this.jsonSections = [];
  }

  /**
   * Populate JSON sections from existing additional data in edit mode
   * Following Angular Architecture KB: Service Responsibility Segregation
   */
  private populateJsonSectionsFromAdditionalData(): void {
    const additionalDataValue = this.form.get('additionalData')?.value;

    if (!additionalDataValue || additionalDataValue.trim() === '') {
      return;
    }

    try {
      const parsedData = JSON.parse(additionalDataValue);

      // Clear existing sections
      this.jsonSections = [];

      // Create sections from parsed data
      Object.keys(parsedData).forEach((sectionName, index) => {
        const sectionData = parsedData[sectionName];

        // Handle both nested objects and flat key-value pairs
        let data: { [key: string]: any } = {};

        if (typeof sectionData === 'object' && sectionData !== null && !Array.isArray(sectionData)) {
          // If it's an object, use its properties as key-value pairs
          data = sectionData;
        } else {
          // If it's a primitive value or array, create a single key-value pair
          data['A B C'] = sectionData; // Use the key from your example
        }

        const section: JsonEditorSection = {
          id: `section_${Date.now()}_${index}`,
          name: sectionName,
          description: '',
          data: data,
          isEditable: true
        };

        this.jsonSections.push(section);
      });

      // Set active tab to first section if any exist
      if (this.jsonSections.length > 0) {
        this.activeJsonTab = 0;
      }
    } catch (error) {
      console.warn('Failed to parse additional data for JSON sections:', error);
      // If parsing fails, leave sections empty
    }
  }

  /**
   * Get credit scores form array
   */
  get creditScores(): FormArray {
    return this.form.get('creditScores') as FormArray;
  }

  /**
   * Add new credit score - delegated to focused component
   */
  addCreditScore(): void {
    if (this.creditScoresComponent) {
      this.creditScoresComponent.addScore();
    }
  }

  /**
   * Remove credit score - delegated to focused component
   */
  removeCreditScore(index: number): void {
    if (this.creditScoresComponent) {
      this.creditScoresComponent.removeScore(index);
    }
  }

  /**
   * Check if delete is disabled - delegated to focused component
   */
  isDeleteDisabled(): boolean {
    return this.creditScoresComponent ? this.creditScoresComponent.isDeleteDisabled() : true;
  }

  /**
   * JSON Section Management
   */
  addJsonSection(): void {
    const newSection: JsonEditorSection = {
      id: `section_${Date.now()}`,
      name: '',
      description: '',
      data: {},
      isEditable: true
    };
    this.jsonSections.push(newSection);
    this.activeJsonTab = this.jsonSections.length - 1;
  }

  removeJsonSection(index: number): void {
    // Allow deletion of any section - no minimum requirement
    // Following UI Components KB: Component Communication Patterns
    if (this.jsonSections[index] && this.jsonSections[index].isEditable) {
      this.jsonSections.splice(index, 1);
      this.activeJsonTab = Math.min(this.activeJsonTab, Math.max(0, this.jsonSections.length - 1));
      this.syncJsonToForm();
    }
  }

  updateJsonSection(index: number, key: string, value: any): void {
    if (this.jsonSections[index]) {
      this.jsonSections[index].data[key] = value;
      this.syncJsonToForm();
    }
  }

  removeJsonKey(sectionIndex: number, key: string): void {
    if (this.jsonSections[sectionIndex] && this.jsonSections[sectionIndex].data[key] !== undefined) {
      delete this.jsonSections[sectionIndex].data[key];
      this.syncJsonToForm();
    }
  }

  /**
   * Rename a JSON key while preserving the value
   */
  renameJsonKey(sectionIndex: number, oldKey: string, newKey: string): void {
    if (!this.jsonSections[sectionIndex] || !newKey.trim() || oldKey === newKey) {
      return;
    }

    const section = this.jsonSections[sectionIndex];
    if (section.data.hasOwnProperty(oldKey)) {
      const value = section.data[oldKey];
      delete section.data[oldKey];
      section.data[newKey] = value;
      this.syncJsonToForm();
    }
  }

  addNewField(sectionIndex: number, keyInput: HTMLInputElement, valueInput: HTMLInputElement): void {
    const key = keyInput.value.trim();
    const value = valueInput.value.trim();

    if (key && this.jsonSections[sectionIndex]) {
      this.jsonSections[sectionIndex].data[key] = value;
      keyInput.value = '';
      valueInput.value = '';
      this.syncJsonToForm();
    }
  }

  getFieldCount(section: JsonEditorSection): number {
    return Object.keys(section.data).length;
  }

  isSectionNameValid(section: JsonEditorSection): boolean {
    return section.name.trim().length > 0;
  }

  areAllSectionNamesValid(): boolean {
    return this.jsonSections.every((section) => this.isSectionNameValid(section));
  }

  getJsonPreview(): string {
    const combinedData = this.jsonSections.reduce((acc, section) => {
      acc[section.name] = section.data;
      return acc;
    }, {} as any);

    return JSON.stringify(combinedData, null, 2);
  }

  private syncJsonToForm(): void {
    const combinedData = this.jsonSections.reduce((acc, section) => {
      // Use section name as the key to preserve section structure
      acc[section.name] = section.data;
      return acc;
    }, {} as any);

    this.form.patchValue({
      additionalData: JSON.stringify(combinedData)
    });
  }

  toggleJsonPreview(): void {
    this.showJsonPreview = !this.showJsonPreview;
  }

  /**
   * Form submission - using validation service for data preparation
   * Following UI Components KB: Form Validation Patterns
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.markAllFieldsTouched();
      return;
    }

    // Check for duplicate score models before submission
    if (this.creditScoresComponent && this.creditScoresComponent.hasDuplicateScoreModels()) {
      this.markAllFieldsTouched();
      // The error messages will be shown in the template
      return;
    }

    // Validate JSON sections before submission
    if (!this.areAllSectionNamesValid()) {
      // Mark sections as touched to show validation errors
      this.jsonSections.forEach((section) => {
        if (!this.isSectionNameValid(section)) {
          // Focus on the first invalid section
          const invalidIndex = this.jsonSections.findIndex((s) => !this.isSectionNameValid(s));
          this.activeJsonTab = invalidIndex;
        }
      });
      return;
    }

    this.isSubmitting = true;

    // Prepare submission data using validation service
    const submissionData = this.validationService.prepareSubmissionData(this.form.value, this.mode);

    this.formSubmit.emit(submissionData);
  }

  /**
   * Mark all fields as touched for validation display
   */
  private markAllFieldsTouched(): void {
    this.form.markAllAsTouched();

    // Mark focused components as touched
    if (this.creditScoresComponent) {
      this.creditScoresComponent.markAllAsTouched();
    }
    if (this.customerInfoComponent) {
      this.customerInfoComponent.markAllAsTouched();
    }
    if (this.financialInfoComponent) {
      this.financialInfoComponent.markAllAsTouched();
    }
  }

  /**
   * Cancel form submission
   */
  onCancel(): void {
    this.formCancel.emit();
  }

  /**
   * Handle credit scores changes from focused component
   */
  onScoresChange(scores: any[]): void {
    // Update form with new scores data
    const scoresArray = this.form.get('creditScores') as FormArray;
    scoresArray.clear();

    scores.forEach((score) => {
      scoresArray.push(this.fb.group(score));
    });
  }

  /**
   * Get error message - delegated to validation service
   */
  getErrorMessage(controlName: string, index?: number): string {
    return this.validationService.getErrorMessage(this.form, controlName, index);
  }

  /**
   * Check if JSON field is valid - delegated to validation service
   */
  isJsonFieldValid(fieldName: string, scoreIndex?: number): boolean {
    return this.validationService.isJsonFieldValid(this.form, fieldName, scoreIndex);
  }

  /**
   * Format JSON for display
   */
  formatJsonForDisplay(jsonString: string): string {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return jsonString;
    }
  }
}
