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

import { Directive, Input, OnInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Guarantor Form Extension Directive
 *
 * This directive provides extension marker functionality for the guarantor form.
 * It follows the Angular-native approach for extending form components with
 * additional features without requiring template modifications.
 *
 * Key Features:
 * - Extension marker for guarantor form
 * - CSS class injection for styling
 * - Lifecycle-aware cleanup
 * - Fork-safe architecture
 *
 * Usage:
 * <form mifosxGuarantorFormExtension>
 *   <!-- Existing form content -->
 * </form>
 */
@Directive({
  selector: '[mifosxGuarantorFormExtension]'
})
export class GuarantorFormExtensionDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private isInitialized = false;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    if (!this.isInitialized) {
      this.initializeExtension();
      this.isInitialized = true;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeExtension(): void {
    // Add CSS class for styling
    this.renderer.addClass(this.elementRef.nativeElement, 'guarantor-form-extended');

    // The actual form extension logic is handled by the GuarantorFormExtensionService
    // This directive serves as a marker and provides styling context
  }
}
