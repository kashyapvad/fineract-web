import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import {
  CreditBureauReport,
  CreateCreditReportRequest,
  UpdateCreditReportRequest
} from '../services/client-credit-bureau.service';

/**
 * Service responsible for credit report form validation logic.
 *
 * Following Angular Architecture KB: Service Responsibility Segregation
 * Following UI Components KB: Form Validation Patterns
 * - Single responsibility: Validation logic for credit report forms
 * - Reusable validation functions
 * - Clean separation from UI components
 */
@Injectable({
  providedIn: 'root'
})
export class CreditReportValidationService {
  constructor(private fb: FormBuilder) {}

  /**
   * Create default credit score group for initialization
   * Following UI Components KB: Form Design and Validation
   */
  private createDefaultCreditScoreGroup(): FormGroup {
    return this.fb.group({
      scoreModel: [
        'TRANSUNION_CIBIL',
        [Validators.required]
      ],
      creditScore: [
        '',
        [
          Validators.required,
          Validators.min(300),
          Validators.max(900),
          Validators.pattern(/^\d+$/)]
      ],
      scoreVersion: [''],
      scoreName: [''],
      scoreReason: [''],
      scorePercentile: [
        '',
        [
          Validators.min(0),
          Validators.max(100)]
      ]
    });
  }

  /**
   * Create credit report form with proper validation
   * Following Angular Architecture KB: Service Responsibility Segregation
   */
  createCreditReportForm(initialReport?: CreditBureauReport): FormGroup {
    return this.fb.group({
      reportSummary: [initialReport?.reportSummary || ''],
      reportNotes: [initialReport?.reportNotes || ''],

      // Enhanced Credit Scores Array - Always start with at least one score
      creditScores: this.fb.array([this.createDefaultCreditScoreGroup()]),

      // Enhanced Customer Information with missing fields
      customerName: [initialReport?.customerName || ''],
      customerPan: [
        initialReport?.customerPan || '',
        [Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]
      ],
      customerAadhaar: [
        initialReport?.customerAadhaar || '',
        [Validators.pattern(/^[0-9]{12}$/)]
      ],
      customerMobile: [
        initialReport?.customerMobile || '',
        [Validators.pattern(/^[0-9]{10}$/)]
      ],
      // NEW: Missing customer fields
      customerAddress: [initialReport?.customerAddress || ''],
      dateOfBirth: [initialReport?.dateOfBirth || ''],
      gender: [initialReport?.gender || ''],

      // Financial Information
      totalAccounts: [
        initialReport?.totalAccounts ?? '',
        [Validators.min(0)]
      ],
      activeAccounts: [
        initialReport?.activeAccounts ?? '',
        [Validators.min(0)]
      ],
      closedAccounts: [
        initialReport?.closedAccounts ?? '',
        [Validators.min(0)]
      ],
      overdueAccounts: [
        initialReport?.overdueAccounts ?? '',
        [Validators.min(0)]
      ],
      totalCreditLimit: [
        initialReport?.totalCreditLimit ?? '',
        [Validators.min(0)]
      ],
      totalOutstandingAmount: [
        initialReport?.totalOutstandingAmount ?? '',
        [Validators.min(0)]
      ],
      totalOverdueAmount: [
        initialReport?.totalOverdueAmount ?? '',
        [Validators.min(0)]
      ],
      // NEW: Missing financial field
      highestCreditAmount: [
        initialReport?.highestCreditAmount ?? '',
        [Validators.min(0)]
      ],

      // Delinquency Information
      daysPastDue: [
        initialReport?.daysPastDue ?? '',
        [Validators.min(0)]
      ],
      worstStatus12Months: [initialReport?.worstStatus12Months || ''],
      worstStatus24Months: [initialReport?.worstStatus24Months || ''],

      // Enquiry Information
      enquiriesLast30Days: [
        initialReport?.enquiriesLast30Days ?? '',
        [Validators.min(0)]
      ],
      enquiriesLast90Days: [
        initialReport?.enquiriesLast90Days ?? '',
        [Validators.min(0)]
      ],
      enquiriesLast12Months: [
        initialReport?.enquiriesLast12Months ?? '',
        [Validators.min(0)]
      ],

      // Enhanced JSON Management
      additionalData: [
        initialReport?.additionalData ? JSON.stringify(initialReport.additionalData, null, 2) : '',
        [this.jsonValidator]
      ]
    });
  }

  /**
   * Prepare submission data for create or update
   * Following Angular Architecture KB: Service Responsibility Segregation
   */
  prepareSubmissionData(
    formValue: any,
    mode: 'create' | 'edit'
  ): CreateCreditReportRequest | UpdateCreditReportRequest {
    // Helper function to filter out empty values for numeric fields
    const filterNumericValue = (value: any): any => {
      if (value === '' || value === null || value === undefined) {
        return undefined; // Don't include empty values in payload
      }
      return value;
    };

    // Helper function to filter out empty values for string fields
    const filterStringValue = (value: any): any => {
      if (value === '' || value === null || value === undefined) {
        return undefined; // Don't include empty values in payload
      }
      return value;
    };

    // Special filter for clearable fields - sends empty string instead of undefined
    const filterClearableStringValue = (value: any): any => {
      if (value === null || value === undefined) {
        return '';
      }
      return value;
    };

    // Process credit scores with enhanced data
    const processedCreditScores = formValue.creditScores.map((score: any) => ({
      scoreModel: score.scoreModel,
      creditScore: score.creditScore,
      scoreVersion: score.scoreVersion,
      scoreName: score.scoreName,
      scoreReason: score.scoreReason,
      // NEW enhanced fields
      scorePercentile: score.scorePercentile,
      scoringElements: score.scoringElements ? JSON.parse(score.scoringElements) : undefined,
      providerScoreId: score.providerScoreId,
      providerMetadata: score.providerMetadata ? JSON.parse(score.providerMetadata) : undefined
    }));

    const payload: any = {
      // Required parameters for backend processing
      locale: 'en',
      dateFormat: 'yyyy-MM-dd',

      // Use clearable filter for fields that need to be clearable
      reportSummary: filterClearableStringValue(formValue.reportSummary),
      reportNotes: filterClearableStringValue(formValue.reportNotes),
      additionalData: formValue.additionalData || '',

      // Enhanced customer information (filter empty values)
      customerName: filterStringValue(formValue.customerName),
      customerPan: filterStringValue(formValue.customerPan),
      customerAadhaar: filterStringValue(formValue.customerAadhaar),
      customerMobile: filterStringValue(formValue.customerMobile),
      customerAddress: filterStringValue(formValue.customerAddress),
      dateOfBirth: filterStringValue(formValue.dateOfBirth),
      gender: filterStringValue(formValue.gender),

      // Financial information (filter empty values)
      totalAccounts: filterNumericValue(formValue.totalAccounts),
      activeAccounts: filterNumericValue(formValue.activeAccounts),
      closedAccounts: filterNumericValue(formValue.closedAccounts),
      overdueAccounts: filterNumericValue(formValue.overdueAccounts),
      totalCreditLimit: filterNumericValue(formValue.totalCreditLimit),
      totalOutstandingAmount: filterNumericValue(formValue.totalOutstandingAmount),
      totalOverdueAmount: filterNumericValue(formValue.totalOverdueAmount),
      highestCreditAmount: filterNumericValue(formValue.highestCreditAmount),

      // Delinquency information (filter empty values)
      daysPastDue: filterNumericValue(formValue.daysPastDue),
      worstStatus12Months: filterStringValue(formValue.worstStatus12Months),
      worstStatus24Months: filterStringValue(formValue.worstStatus24Months),

      // Enquiry information (filter empty values)
      enquiriesLast30Days: filterNumericValue(formValue.enquiriesLast30Days),
      enquiriesLast90Days: filterNumericValue(formValue.enquiriesLast90Days),
      enquiriesLast12Months: filterNumericValue(formValue.enquiriesLast12Months),

      // Enhanced credit scores
      creditScores: processedCreditScores
    };

    // Remove undefined values from payload to avoid sending them to backend
    // But keep empty strings for clearable fields (reportSummary, reportNotes, additionalData)
    const clearableFields = [
      'reportSummary',
      'reportNotes',
      'additionalData'
    ];
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined && !clearableFields.includes(key)) {
        delete payload[key];
      }
    });

    if (mode === 'create') {
      payload.reportType = 'MANUAL_ENTRY';
      payload.creditBureauProvider = 'MANUAL'; // Always manual for user forms
      return payload as CreateCreditReportRequest;
    } else {
      payload.creditBureauProvider = 'MANUAL'; // Always manual for user forms
      return payload as UpdateCreditReportRequest;
    }
  }

  /**
   * Enhanced JSON validator with better error messages
   * Following UI Components KB: Form Validation Patterns
   */
  jsonValidator = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || control.value.trim() === '') {
      return null;
    }
    try {
      const parsed = JSON.parse(control.value);
      // Additional validation for structure
      if (typeof parsed !== 'object') {
        return { invalidJsonStructure: true };
      }
      return null;
    } catch (error) {
      return { invalidJson: true, parseError: (error as Error).message };
    }
  };

  /**
   * Enhanced field label mapping with all new fields
   * Following UI Components KB: Accessibility in Forms
   */
  getFieldLabel(name: string): string {
    const labels: Record<string, string> = {
      // Basic fields
      reportSummary: 'Summary',
      reportNotes: 'Notes',

      // Customer fields
      customerName: 'Customer Name',
      customerPan: 'PAN Number',
      customerAadhaar: 'Aadhaar Number',
      customerMobile: 'Mobile Number',
      customerAddress: 'Address',
      dateOfBirth: 'Date of Birth',
      gender: 'Gender',

      // Financial fields
      totalAccounts: 'Total Accounts',
      activeAccounts: 'Active Accounts',
      closedAccounts: 'Closed Accounts',
      overdueAccounts: 'Overdue Accounts',
      totalCreditLimit: 'Total Credit Limit',
      totalOutstandingAmount: 'Total Outstanding Amount',
      totalOverdueAmount: 'Total Overdue Amount',
      highestCreditAmount: 'Highest Credit Amount',

      // Delinquency fields
      daysPastDue: 'Days Past Due',
      worstStatus12Months: 'Worst Status (12 Months)',
      worstStatus24Months: 'Worst Status (24 Months)',

      // Enquiry fields
      enquiriesLast30Days: 'Enquiries (30 Days)',
      enquiriesLast90Days: 'Enquiries (90 Days)',
      enquiriesLast12Months: 'Enquiries (12 Months)',

      // Score fields
      scoreModel: 'Score Model',
      creditScore: 'Credit Score',
      scoreVersion: 'Score Version',
      scoreName: 'Score Name',
      scoreReason: 'Score Reason',
      scorePercentile: 'Score Percentile',
      scoringElements: 'Scoring Elements',
      providerScoreId: 'Provider Score ID',
      providerMetadata: 'Provider Metadata',

      // JSON fields
      additionalData: 'Additional Data'
    };
    return labels[name] || name;
  }

  /**
   * Enhanced error message handling for all fields - updated to work with FormGroup
   * Following UI Components KB: Form Validation Patterns
   */
  getErrorMessage(form: FormGroup, controlName: string, index?: number): string {
    let control: AbstractControl | null;

    if (index !== undefined && controlName !== 'creditScores') {
      // Handle credit score field errors
      const creditScores = form.get('creditScores') as FormArray;
      control = (creditScores.at(index) as FormGroup).get(controlName);
    } else if (controlName === 'creditScores' && index !== undefined) {
      const creditScores = form.get('creditScores') as FormArray;
      control = (creditScores.at(index) as FormGroup).get('creditScore');
    } else {
      control = form.get(controlName);
    }

    if (!control || !control.errors) {
      return '';
    }

    const errors = control.errors;

    if (errors['required']) {
      return `${this.getFieldLabel(controlName)} is required`;
    }
    if (errors['invalidJson']) {
      return `Invalid JSON format${errors['parseError'] ? ': ' + errors['parseError'] : ''}`;
    }
    if (errors['invalidJsonStructure']) {
      return 'JSON must be an object';
    }
    if (errors['pattern']) {
      if (controlName === 'creditScore') {
        return 'Credit score must be a valid number';
      }
      if (controlName === 'customerPan') {
        return 'PAN must be in format: ABCDE1234F';
      }
      if (controlName === 'customerAadhaar') {
        return 'Aadhaar must be 12 digits';
      }
      if (controlName === 'customerMobile') {
        return 'Mobile number must be 10 digits';
      }
      return `Invalid ${this.getFieldLabel(controlName)} format`;
    }
    if (errors['min']) {
      if (controlName === 'creditScore') {
        return 'Credit score must be at least 300';
      }
      if (controlName === 'scorePercentile') {
        return 'Percentile cannot be negative';
      }
      return `${this.getFieldLabel(controlName)} cannot be negative`;
    }
    if (errors['max']) {
      if (controlName === 'creditScore') {
        return 'Credit score cannot exceed 900';
      }
      if (controlName === 'scorePercentile') {
        return 'Percentile cannot exceed 100';
      }
      return `${this.getFieldLabel(controlName)} is too high`;
    }
    if (errors['scoreOutOfRange']) {
      return 'Score is outside the valid range (300-900)';
    }

    return 'Invalid value';
  }

  /**
   * Helper method to check if JSON field has valid data - updated to work with FormGroup
   * Following UI Components KB: Form Validation Patterns
   */
  isJsonFieldValid(form: FormGroup, fieldName: string, scoreIndex?: number): boolean {
    let control: AbstractControl | null;

    if (scoreIndex !== undefined) {
      const creditScores = form.get('creditScores') as FormArray;
      control = (creditScores.at(scoreIndex) as FormGroup).get(fieldName);
    } else {
      control = form.get(fieldName);
    }

    return control ? !control.hasError('invalidJson') && !control.hasError('invalidJsonStructure') : false;
  }

  /**
   * Helper method to format JSON for display
   * Following UI Components KB: Form Design and Validation
   */
  formatJsonForDisplay(jsonString: string): string {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  }
}
