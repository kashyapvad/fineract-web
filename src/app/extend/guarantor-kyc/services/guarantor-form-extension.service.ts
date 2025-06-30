/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Injectable } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { GuarantorKycService } from './guarantor-kyc.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Guarantor Form Extension Service
 *
 * This service follows the Fork Safety Pattern by providing non-invasive
 * runtime extensions to the create guarantor form component. All extension logic
 * is contained within this service, minimizing upstream modifications.
 *
 * Key Features:
 * - Dynamic form control management
 * - Guarantor KYC data loading
 * - Form state management
 * - Submit data transformation
 * - Method enhancement
 *
 * This approach ensures:
 * - Minimal upstream changes (only 4-6 lines in component)
 * - All extension logic in extend folder
 * - Maintainable and testable code
 * - Fork-safe architecture
 */
@Injectable({
  providedIn: 'root'
})
export class GuarantorFormExtensionService {
  constructor(
    private guarantorKycService: GuarantorKycService,
    private dateUtils: Dates
  ) {}

  /**
   * Initialize guarantor form extensions
   */
  initializeGuarantorForm(component: any): void {
    // Add extension properties to component
    this.addExtensionProperties(component);

    // Setup extension form controls
    this.setupExtensionFormControls(component);

    // Enhance submit method
    this.enhanceSubmitMethod(component);

    // Enhance form dependencies after original component sets up its dependencies
    this.enhanceFormDependencies(component);

    // Load initial data
    this.loadGuarantorKycData(component);
  }

  /**
   * Add extension properties to component
   */
  private addExtensionProperties(component: any): void {
    component.guarantorKycData = [];
    component.showGuarantorKycDetailsForm = false;
    component.selectedGuarantorKyc = null;
    component.isLoadingGuarantorKycs = false;
    component.cachedClientId = null;
  }

  /**
   * Setup extension form controls
   */
  private setupExtensionFormControls(component: any): void {
    try {
      if (!component.newGuarantorForm.get('existingGuarantor')) {
        component.newGuarantorForm.addControl('existingGuarantor', new UntypedFormControl(false));
        console.log('Added existingGuarantor control');
      }
      if (!component.newGuarantorForm.get('guarantorName')) {
        component.newGuarantorForm.addControl('guarantorName', new UntypedFormControl(''));
        console.log('Added guarantorName control');
      }
    } catch (error) {
      console.error('Error setting up extension form controls:', error);
    }
  }

  /**
   * Enhance form dependencies with extension logic
   */
  private enhanceFormDependencies(component: any): void {
    // Add our dependencies directly
    this.addExtensionDependencies(component);
  }

  /**
   * Add extension-specific form dependencies
   */
  private addExtensionDependencies(component: any): void {
    // Ensure one option is always selected - mutual exclusivity with auto-selection
    const existingGuarantorControl = component.newGuarantorForm.get('existingGuarantor');
    const existingClientControl = component.newGuarantorForm.get('existingClient');

    if (existingGuarantorControl && existingClientControl) {
      // Handle existing client changes
      existingClientControl.valueChanges.subscribe((value: boolean) => {
        if (value) {
          // Client selected - clear guarantor
          component.newGuarantorForm.patchValue({ existingGuarantor: false }, { emitEvent: false });
          component.showGuarantorKycDetailsForm = false;
          component.selectedGuarantorKyc = null;
        } else {
          // Client deselected - auto-select guarantor
          component.newGuarantorForm.patchValue({ existingGuarantor: true }, { emitEvent: true });
        }
      });

      // Handle guarantor checkbox
      existingGuarantorControl.valueChanges.subscribe((value: boolean) => {
        if (value) {
          // Guarantor selected - clear client and setup guarantor form
          component.newGuarantorForm.patchValue({ existingClient: false }, { emitEvent: false });
          component.showGuarantorKycDetailsForm = true;
          component.showClientDetailsForm = true;
          component.selectedGuarantorKyc = null;

          // Setup form controls for guarantor
          this.addExternalControls(component);
          this.removeClientControls(component);

          // Load guarantor data
          this.loadGuarantorKycData(component);
        } else {
          // Guarantor deselected - auto-select client
          component.showGuarantorKycDetailsForm = false;
          component.selectedGuarantorKyc = null;
          component.newGuarantorForm.patchValue({ guarantorName: '' }, { emitEvent: false });
          component.newGuarantorForm.patchValue({ existingClient: true }, { emitEvent: true });
        }
      });
    }
  }

  /**
   * Load guarantor KYC data
   */
  private loadGuarantorKycData(component: any): void {
    const clientId = this.getClientIdFromComponent(component);

    if (!clientId) {
      console.warn('No client ID found, cannot load guarantor KYCs');
      component.guarantorKycData = [];
      return;
    }

    if (component.cachedClientId === clientId && component.guarantorKycData.length > 0) {
      return;
    }

    component.isLoadingGuarantorKycs = true;

    this.guarantorKycService.getGuarantorKycList(clientId).subscribe({
      next: (data: any[]) => {
        component.guarantorKycData = data || [];
        component.cachedClientId = clientId;
        component.isLoadingGuarantorKycs = false;
      },
      error: (error: any) => {
        console.error('Error loading guarantor KYCs:', error);
        component.guarantorKycData = [];
        component.isLoadingGuarantorKycs = false;
      }
    });
  }

  /**
   * Get client ID from component data
   */
  private getClientIdFromComponent(component: any): number | null {
    if (component.dataObject?.clientId) {
      return component.dataObject.clientId;
    }
    if (component.dataObject?.client?.id) {
      return component.dataObject.client.id;
    }
    const routeClientId =
      component.route.snapshot.params['clientId'] || component.route.parent?.snapshot.params['clientId'];
    if (routeClientId) {
      return parseInt(routeClientId, 10);
    }
    return null;
  }

  /**
   * Add external guarantor form controls
   */
  private addExternalControls(component: any): void {
    const externalControls = [
      'firstname',
      'lastname',
      'dob',
      'addressLine1',
      'addressLine2',
      'city',
      'zip',
      'mobileNumber',
      'housePhoneNumber'
    ];

    externalControls.forEach((controlName) => {
      if (!component.newGuarantorForm.get(controlName)) {
        component.newGuarantorForm.addControl(controlName, new UntypedFormControl(''));
      }
    });
  }

  /**
   * Remove client-specific form controls
   */
  private removeClientControls(component: any): void {
    const clientControls = [
      'name',
      'savingsId',
      'amount'
    ];
    clientControls.forEach((controlName) => {
      if (component.newGuarantorForm.get(controlName)) {
        component.newGuarantorForm.removeControl(controlName);
      }
    });
  }

  /**
   * Handle guarantor KYC selection
   */
  guarantorKycSelected(component: any, guarantorKycDetails: any): void {
    component.selectedGuarantorKyc = guarantorKycDetails;

    if (guarantorKycDetails) {
      const fullName = guarantorKycDetails.fullName || '';
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

      const formData: any = {
        firstname: firstName,
        lastname: lastName,
        mobileNumber: guarantorKycDetails.mobileNumber || ''
      };

      if (guarantorKycDetails.relationshipToClient) {
        const matchingRelationType = component.relationTypes?.find(
          (relType: any) => relType.name?.toLowerCase() === guarantorKycDetails.relationshipToClient?.toLowerCase()
        );

        if (matchingRelationType) {
          formData.clientRelationshipTypeId = matchingRelationType.id;
        }
      }

      component.newGuarantorForm.patchValue(formData);
    }
  }

  /**
   * Enhance submit method with extension logic
   */
  private enhanceSubmitMethod(component: any): void {
    const originalSubmit = component.submit.bind(component);

    component.submit = () => {
      const formData = component.newGuarantorForm.value;

      if (formData.existingGuarantor) {
        // Handle guarantor KYC submission
        this.handleGuarantorKycSubmit(component);
      } else {
        // Use original submit logic
        originalSubmit();
      }
    };
  }

  /**
   * Handle guarantor KYC specific submission
   */
  private handleGuarantorKycSubmit(component: any): void {
    const newGuarantorFormData = component.newGuarantorForm.value;
    const locale = component.settingsService.language.code;
    const dateFormat = component.settingsService.dateFormat;
    const prevdob: Date = component.newGuarantorForm.value.dob;

    const selectedGuarantor = component.newGuarantorForm.controls.guarantorName.value;
    const data = {
      ...newGuarantorFormData,
      locale,
      dateFormat,
      guarantorTypeId: 4, // GUARANTOR_KYC type
      existingGuarantorKycId: selectedGuarantor?.id
    };

    if (newGuarantorFormData.dob instanceof Date) {
      data['dob'] = this.dateUtils.formatDate(prevdob, dateFormat);
    }

    // Clean up form control fields
    delete data.existingClient;
    delete data.existingGuarantor;
    delete data.name;
    delete data.guarantorName;
    delete data.entityId;

    component.loanService.createNewGuarantor(component.loanId, data).subscribe((response: any) => {
      component.router.navigate(['../../general'], { relativeTo: component.route });
    });
  }
}
