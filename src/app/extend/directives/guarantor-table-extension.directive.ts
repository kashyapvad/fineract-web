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

import {
  Directive,
  Input,
  OnInit,
  OnDestroy,
  ElementRef,
  Renderer2,
  ViewContainerRef,
  TemplateRef,
  ComponentFactoryResolver
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Guarantor Table Extension Directive
 *
 * This directive follows the Angular-native approach for extending mat-table
 * components with additional columns. It dynamically injects KYC column
 * definitions and cell templates without requiring template modifications.
 *
 * Key Features:
 * - Dynamic column injection
 * - Template-based cell rendering
 * - Lifecycle-aware cleanup
 * - Fork-safe architecture
 *
 * Usage:
 * <table mat-table mifosxGuarantorTableExtension [clientId]="clientId">
 *   <!-- Existing columns -->
 * </table>
 */
@Directive({
  selector: '[mifosxGuarantorTableExtension]'
})
export class GuarantorTableExtensionDirective implements OnInit, OnDestroy {
  @Input() clientId: number;

  private destroy$ = new Subject<void>();
  private isInitialized = false;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private viewContainerRef: ViewContainerRef
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
    // The extension logic is primarily handled by the service
    // This directive serves as a marker and provides clientId context

    // Add CSS class for styling
    this.renderer.addClass(this.elementRef.nativeElement, 'guarantor-table-extended');

    // The actual column injection is handled by the GuarantorViewExtensionService
    // This ensures separation of concerns and maintainability
  }
}
