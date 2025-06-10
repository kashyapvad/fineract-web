import { Injectable } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ClientsService } from 'app/clients/clients.service';

/**
 * Service responsible for auto-filling credit report forms with client data.
 *
 * Following Angular Architecture KB: Service Responsibility Segregation
 * - Single responsibility: Auto-fill logic for credit report forms
 * - Clean separation from UI components
 * - Reusable across different form components
 */
@Injectable({
  providedIn: 'root'
})
export class CreditReportAutofillService {
  constructor(private clientsService: ClientsService) {}

  /**
   * Auto-fill form with client data for create mode
   * Following UI Components KB: Form Design and Validation
   */
  autoFillForCreateMode(
    form: FormGroup,
    clientId: number,
    clientData?: any,
    clientIdentifiers?: any[],
    clientKycData?: any,
    clientAddresses?: any[]
  ): Observable<void> {
    if (!clientId) {
      return this.autoFillFromExistingData(form, clientData, clientAddresses);
    }

    // OPTIMIZATION: Use existing client data if available (passed from management page)
    if (clientData && clientIdentifiers !== undefined) {
      return this.autoFillFromExistingData(form, clientData, clientAddresses, clientIdentifiers, clientKycData);
    }

    // Load comprehensive client data
    return this.loadAndAutoFillClientData(form, clientId);
  }

  /**
   * Auto-fill missing fields in edit mode
   * Following Angular Architecture KB: Component Responsibility Separation
   */
  autoFillMissingFields(
    form: FormGroup,
    clientId: number,
    clientData?: any,
    clientKycData?: any,
    clientAddresses?: any[]
  ): Observable<void> {
    if (!clientId) {
      return of();
    }

    const formValues = form.value;
    const missingFields = this.analyzeMissingFields(formValues);

    if (!Object.values(missingFields).some((missing) => missing)) {
      return of();
    }

    // OPTIMIZATION: Use existing client data if available
    if (clientData) {
      const patchData = this.fillClientDataFromSources(clientData, clientAddresses || [], missingFields, clientKycData);
      if (Object.keys(patchData).length > 0) {
        form.patchValue(patchData);
      }
      return of();
    }

    // Load client data to fill missing fields
    return this.loadAndAutoFillMissingFields(form, clientId, missingFields);
  }

  /**
   * Auto-fill from existing data without API calls
   * Following Performance KB: Minimize API calls
   */
  private autoFillFromExistingData(
    form: FormGroup,
    clientData: any,
    clientAddresses?: any[],
    clientIdentifiers?: any[],
    clientKycData?: any
  ): Observable<void> {
    if (!clientData) {
      return of();
    }

    const addressesToUse = clientAddresses || [];
    const activeAddresses = addressesToUse.filter((addr: any) => addr.isActive);

    const patchData = this.fillClientDataFromSources(
      clientData,
      activeAddresses,
      undefined,
      clientKycData,
      clientIdentifiers
    );

    if (Object.keys(patchData).length > 0) {
      form.patchValue(patchData);
    }

    return of();
  }

  /**
   * Load client data and auto-fill form
   * Following Angular Architecture KB: HTTP Service Abstraction Patterns
   */
  private loadAndAutoFillClientData(form: FormGroup, clientId: number): Observable<void> {
    const clientData$ = this.clientsService.getClientData(clientId.toString()).pipe(catchError((error) => of(null)));

    const clientIdentifiers$ = this.clientsService
      .getClientIdentifiers(clientId.toString())
      .pipe(catchError((error) => of([])));

    const clientAddress$ = this.clientsService
      .getClientAddressData(clientId.toString())
      .pipe(catchError((error) => of([])));

    return new Observable((observer) => {
      forkJoin({
        clientData: clientData$,
        identifiers: clientIdentifiers$,
        addresses: clientAddress$
      }).subscribe({
        next: (result) => {
          const allAddresses = Array.isArray(result.addresses) ? result.addresses : [];
          const activeAddresses = allAddresses.filter((addr: any) => addr.isActive);
          const identifiers = Array.isArray(result.identifiers) ? result.identifiers : [];
          const patchData = this.fillClientDataFromSources(
            result.clientData,
            activeAddresses,
            undefined,
            undefined,
            identifiers
          );

          if (Object.keys(patchData).length > 0) {
            form.patchValue(patchData);
          }
          observer.next();
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Load client data for missing fields only
   * Following Performance KB: Optimize API calls
   */
  private loadAndAutoFillMissingFields(form: FormGroup, clientId: number, missingFields: any): Observable<void> {
    const clientData$ = this.clientsService.getClientData(clientId.toString()).pipe(catchError((error) => of(null)));

    const clientAddress$ = this.clientsService
      .getClientAddressData(clientId.toString())
      .pipe(catchError((error) => of([])));

    return new Observable((observer) => {
      forkJoin({
        clientData: clientData$,
        addresses: clientAddress$
      }).subscribe({
        next: (result) => {
          const allAddresses = Array.isArray(result.addresses) ? result.addresses : [];
          const activeAddresses = allAddresses.filter((addr: any) => addr.isActive);
          const patchData = this.fillClientDataFromSources(result.clientData, activeAddresses, missingFields);

          if (Object.keys(patchData).length > 0) {
            form.patchValue(patchData);
          }
          observer.next();
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Analyze which fields are missing from the form
   * Following UI Components KB: Form Validation Patterns
   */
  private analyzeMissingFields(formValues: any): any {
    return {
      customerName: !formValues.customerName || formValues.customerName.trim() === '',
      customerPan: !formValues.customerPan || formValues.customerPan.trim() === '',
      customerAadhaar: !formValues.customerAadhaar || formValues.customerAadhaar.trim() === '',
      customerMobile: !formValues.customerMobile || formValues.customerMobile.trim() === '',
      customerAddress: !formValues.customerAddress || formValues.customerAddress.trim() === '',
      dateOfBirth: !formValues.dateOfBirth || formValues.dateOfBirth.trim() === '',
      gender: !formValues.gender || formValues.gender.trim() === ''
    };
  }

  /**
   * CONSOLIDATED CLIENT DATA FILLING METHOD - DRY Principle Implementation
   *
   * Following Angular Architecture KB: Service Responsibility Segregation
   * Following Performance KB: Shared Module Optimization (prevent code duplication)
   */
  private fillClientDataFromSources(
    clientData: any,
    addresses: any[],
    missingFields?: any,
    clientKycData?: any,
    clientIdentifiers?: any[]
  ): any {
    if (!clientData) {
      return {};
    }

    const patchData: any = {};

    // Fill customer name
    if (!missingFields || missingFields.customerName) {
      const customerName =
        clientData.displayName ||
        clientData.fullName ||
        (clientData.firstname && clientData.lastname ? `${clientData.firstname} ${clientData.lastname}` : '');
      if (customerName) {
        patchData.customerName = customerName;
      }
    }

    // Fill mobile number
    if (!missingFields || missingFields.customerMobile) {
      const customerMobile = clientData.mobileNo || clientData.mobileNumber;
      if (customerMobile) {
        patchData.customerMobile = customerMobile;
      }
    }

    // Fill PAN/Aadhaar from KYC data first, then fall back to identifiers
    if (clientKycData) {
      if ((!missingFields || missingFields.customerPan) && clientKycData.panNumber) {
        patchData.customerPan = clientKycData.panNumber;
      }
      if ((!missingFields || missingFields.customerAadhaar) && clientKycData.aadhaarNumber) {
        patchData.customerAadhaar = clientKycData.aadhaarNumber;
      }
    }

    // Fall back to identifiers if KYC data didn't provide PAN/Aadhaar
    if (clientIdentifiers && Array.isArray(clientIdentifiers)) {
      // Fill PAN if still missing
      if ((!missingFields || missingFields.customerPan) && !patchData.customerPan) {
        const panIdentifier = clientIdentifiers.find(
          (id: any) => id.documentType && id.documentType.name && id.documentType.name.toUpperCase().includes('PAN')
        );
        if (panIdentifier && panIdentifier.documentKey) {
          patchData.customerPan = panIdentifier.documentKey;
        }
      }

      // Fill Aadhaar if still missing
      if ((!missingFields || missingFields.customerAadhaar) && !patchData.customerAadhaar) {
        const aadhaarIdentifier = clientIdentifiers.find(
          (id: any) => id.documentType && id.documentType.name && id.documentType.name.toUpperCase().includes('AADHAAR')
        );
        if (aadhaarIdentifier && aadhaarIdentifier.documentKey) {
          patchData.customerAadhaar = aadhaarIdentifier.documentKey;
        }
      }
    }

    // Fill date of birth with proper format handling
    if ((!missingFields || missingFields.dateOfBirth) && clientData.dateOfBirth) {
      if (Array.isArray(clientData.dateOfBirth) && clientData.dateOfBirth.length >= 3) {
        const [
          year,
          month,
          day
        ] = clientData.dateOfBirth;
        patchData.dateOfBirth = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      } else if (typeof clientData.dateOfBirth === 'string') {
        patchData.dateOfBirth = clientData.dateOfBirth;
      }
    }

    // Fill gender with proper normalization
    if ((!missingFields || missingFields.gender) && clientData.gender) {
      const gender = clientData.gender.name || clientData.gender;
      if (gender) {
        patchData.gender = gender.toUpperCase();
      }
    }

    // Fill address from addresses array - only use active addresses
    if ((!missingFields || missingFields.customerAddress) && Array.isArray(addresses) && addresses.length) {
      // Filter for active addresses first, then fall back to first address if no active ones
      const activeAddresses = addresses.filter((addr: any) => addr.isActive);
      const primaryAddress = activeAddresses.length > 0 ? activeAddresses[0] : addresses[0];

      if (primaryAddress) {
        const addressParts = [
          primaryAddress.street,
          primaryAddress.addressLine1,
          primaryAddress.addressLine2,
          primaryAddress.townVillage,
          primaryAddress.city,
          primaryAddress.stateProvince,
          primaryAddress.countryName,
          primaryAddress.postalCode
        ].filter((part) => part && part.trim());

        if (addressParts.length > 0) {
          patchData.customerAddress = addressParts.join(', ');
        }
      }
    }

    return patchData;
  }

  /**
   * Auto-fill form for edit mode with existing report data
   * Following Angular Architecture KB: Service Responsibility Segregation
   */
  autoFillForEditMode(form: FormGroup, initialReport: any): void {
    if (!initialReport) {
      return;
    }

    // Format date from backend array format to form string format
    const formatDateForForm = (dateValue: any): string => {
      if (!dateValue) return '';

      if (Array.isArray(dateValue) && dateValue.length >= 3) {
        const [
          year,
          month,
          day
        ] = dateValue;
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      }

      if (typeof dateValue === 'string') {
        return dateValue;
      }

      return '';
    };

    // Parse additional data from backend JsonNode structure
    const parseAdditionalDataFromBackend = (additionalData: any): string => {
      if (!additionalData) {
        return '';
      }

      try {
        // Handle the complex JsonNode structure from backend
        let parsedData: any = {};

        if (additionalData._children) {
          // Parse the JsonNode structure
          parsedData = this.parseJsonNodeChildren(additionalData._children);
        } else if (typeof additionalData === 'object') {
          // Direct object structure
          parsedData = additionalData;
        } else if (typeof additionalData === 'string') {
          // JSON string
          parsedData = JSON.parse(additionalData);
        }

        // Return as formatted JSON string for the form field
        return JSON.stringify(parsedData, null, 2);
      } catch (error) {
        console.error('Error parsing additional data:', error);
        return '';
      }
    };

    // Patch all form fields including new ones
    const patchData: any = {
      reportSummary: initialReport.reportSummary,
      reportNotes: initialReport.reportNotes,
      customerName: initialReport.customerName,
      customerPan: initialReport.customerPan,
      customerAadhaar: initialReport.customerAadhaar,
      customerMobile: initialReport.customerMobile,
      // NEW fields
      customerAddress: initialReport.customerAddress,
      dateOfBirth: formatDateForForm(initialReport.dateOfBirth),
      gender: initialReport.gender,

      totalAccounts: initialReport.totalAccounts,
      activeAccounts: initialReport.activeAccounts,
      closedAccounts: initialReport.closedAccounts,
      overdueAccounts: initialReport.overdueAccounts,
      totalCreditLimit: initialReport.totalCreditLimit,
      totalOutstandingAmount: initialReport.totalOutstandingAmount,
      totalOverdueAmount: initialReport.totalOverdueAmount,
      // NEW field
      highestCreditAmount: initialReport.highestCreditAmount,

      daysPastDue: initialReport.daysPastDue,
      worstStatus12Months: initialReport.worstStatus12Months,
      worstStatus24Months: initialReport.worstStatus24Months,
      enquiriesLast30Days: initialReport.enquiriesLast30Days,
      enquiriesLast90Days: initialReport.enquiriesLast90Days,
      enquiriesLast12Months: initialReport.enquiriesLast12Months,
      additionalData: parseAdditionalDataFromBackend(initialReport.additionalData)
    };

    form.patchValue(patchData);

    // Handle credit scores
    const creditScoresArray = form.get('creditScores') as FormArray;
    creditScoresArray.clear();

    const scores = (initialReport as any).creditScores || [];
    scores.forEach((score: any) => {
      const scoreGroup = this.createCreditScoreGroup(score);
      creditScoresArray.push(scoreGroup);
    });

    // If no scores exist in the report, add one default score
    // This ensures there's always at least one score for editing
    if (scores.length === 0) {
      const defaultScoreGroup = this.createCreditScoreGroup();
      creditScoresArray.push(defaultScoreGroup);
    }
  }

  /**
   * Create credit score form group
   * Following Angular Architecture KB: Service Responsibility Segregation
   */
  private createCreditScoreGroup(score?: any): FormGroup {
    const fb = new FormBuilder();

    return fb.group({
      // Basic score information
      scoreModel: [
        score?.scoreModel || 'TRANSUNION_CIBIL',
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
  }

  /**
   * Recursively parse JsonNode _children structure
   */
  private parseJsonNodeChildren(children: any): any {
    const result: any = {};

    for (const key in children) {
      const child = children[key];

      if (child._value !== undefined) {
        // Leaf node with value
        result[key] = child._value;
      } else if (child._children) {
        // Nested object
        result[key] = this.parseJsonNodeChildren(child._children);
      } else {
        // Direct value
        result[key] = child;
      }
    }

    return result;
  }
}
