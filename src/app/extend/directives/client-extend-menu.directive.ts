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

/** Angular Imports */
import { Directive, ElementRef, Input, OnInit, Renderer2, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { ClientExtendActionsService, ExtendAction } from '../services/client-extend-actions.service';

/**
 * Client Extend Menu Directive
 *
 * Non-invasive directive that dynamically adds extend menu items to client dropdown menus
 * without modifying upstream templates. Uses MutationObserver to detect menu opening.
 *
 * Following Angular Architecture KB:
 * - Directive for DOM manipulation
 * - Minimal impact on existing code
 * - Service injection for business logic
 * - Proper lifecycle management
 */
@Directive({
  selector: '[mifosxClientExtendMenu]'
})
export class ClientExtendMenuDirective implements OnInit, OnDestroy, AfterViewInit {
  @Input() clientData: any;

  private addedElements: HTMLElement[] = [];
  private mutationObserver: MutationObserver | null = null;
  private isMenuItemsAdded = false;
  private targetMenuId: string | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private extendActionsService: ClientExtendActionsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Initialize component state
    this.initializeState();
  }

  private initializeState(): void {
    // Reset state variables for clean initialization
    this.isMenuItemsAdded = false;
    this.targetMenuId = null;
  }

  ngAfterViewInit(): void {
    // Get a unique identifier for this menu instance
    this.targetMenuId = this.el.nativeElement.id || `menu-${Date.now()}-${Math.random()}`;
    if (!this.el.nativeElement.id) {
      this.renderer.setAttribute(this.el.nativeElement, 'id', this.targetMenuId);
    }
    this.startObserving();
  }

  ngOnDestroy(): void {
    // Clean up mutation observer
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }

    // Clean up added elements
    this.addedElements.forEach((element) => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
  }

  /**
   * Starts observing for menu panel creation in the DOM
   */
  private startObserving(): void {
    this.mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          // Check if a menu panel was added
          for (const addedNode of Array.from(mutation.addedNodes)) {
            if (addedNode.nodeType === Node.ELEMENT_NODE) {
              const element = addedNode as Element;
              if (element.classList.contains('mat-menu-panel')) {
                // Check if this panel corresponds to our specific menu
                const menuContent = element.querySelector('.mat-menu-content');
                if (menuContent && this.isOurMenuPanel(element)) {
                  // Small delay to ensure the menu is fully rendered
                  setTimeout(() => this.addExtendMenuItems(), 10);
                  break;
                }
              }
            }
          }
        }
      }
    });

    // Start observing the document body for menu panel additions
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Determines if a menu panel belongs to our specific menu
   */
  private isOurMenuPanel(panel: Element): boolean {
    // Look for menu items that are unique to the "More" menu
    const menuContent = panel.querySelector('.mat-menu-content');
    if (!menuContent) return false;

    // Check if this panel contains menu items that are in the "More" menu
    // Look for specific text content that's unique to the More menu
    const menuText = menuContent.textContent || '';
    return (
      menuText.includes('Add Charge') ||
      menuText.includes('Create Collateral') ||
      menuText.includes('Client Screen Reports')
    );
  }

  /**
   * Adds extend menu items to the More submenu
   */
  private addExtendMenuItems(): void {
    if (!this.clientData) {
      return;
    }

    // Prevent adding items multiple times
    if (this.isMenuItemsAdded) {
      return;
    }

    const availableActions = this.extendActionsService.getAvailableActions(this.clientData);

    if (availableActions.length === 0) {
      return;
    }

    // Find the correct menu content container (the More submenu)
    const allMenuPanels = document.querySelectorAll('.mat-menu-panel');
    let targetMenuContent: Element | null = null;

    for (const panel of Array.from(allMenuPanels)) {
      if (this.isOurMenuPanel(panel)) {
        targetMenuContent = panel.querySelector('.mat-menu-content');
        break;
      }
    }

    if (!targetMenuContent) {
      return;
    }

    // Add separator
    const separator = this.createSeparator();
    this.renderer.appendChild(targetMenuContent, separator);
    this.addedElements.push(separator);

    // Add extend actions
    availableActions.forEach((action) => {
      const menuItem = this.createMenuItem(action);
      this.renderer.appendChild(targetMenuContent, menuItem);
      this.addedElements.push(menuItem);
    });

    this.isMenuItemsAdded = true;
  }

  /**
   * Creates a menu separator
   */
  private createSeparator(): HTMLElement {
    const separator = this.renderer.createElement('mat-divider');
    this.renderer.addClass(separator, 'extend-separator');
    this.renderer.setAttribute(separator, 'role', 'separator');
    return separator;
  }

  /**
   * Creates a menu item for an extend action
   */
  private createMenuItem(action: ExtendAction): HTMLElement {
    const button = this.renderer.createElement('button');
    this.renderer.setAttribute(button, 'mat-menu-item', '');
    this.renderer.setAttribute(button, 'type', 'button');
    this.renderer.addClass(button, 'mat-menu-item');
    this.renderer.addClass(button, 'mat-focus-indicator');
    this.renderer.addClass(button, 'extend-menu-item');

    // Important: Add Material Design classes for proper hover behavior
    this.renderer.addClass(button, 'mat-ripple');
    this.renderer.setAttribute(button, 'mat-ripple', '');

    // Create span with text (no icon to match other menu items)
    const span = this.renderer.createElement('span');
    const spanText = this.renderer.createText(action.name);
    this.renderer.appendChild(span, spanText);

    // Append only the text span to button
    this.renderer.appendChild(button, span);

    // Add click handler
    this.renderer.listen(button, 'click', () => {
      this.handleExtendAction(action.name);
    });

    return button;
  }

  /**
   * Handles extend action execution
   */
  private handleExtendAction(actionName: string): void {
    this.extendActionsService.executeAction(actionName, this.clientData.id, this.route);
  }
}
