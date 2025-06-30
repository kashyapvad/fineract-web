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
import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

/**
 * Interface for Client Extend Actions
 */
export interface ClientExtendAction {
  name: string;
  icon?: string;
  route: string;
  condition?: (clientData: any) => boolean;
}

/**
 * Client Extend Actions Service
 *
 * Manages registration and execution of client extension actions.
 * Provides a centralized way to add new actions without modifying
 * upstream components.
 */
@Injectable({
  providedIn: 'root'
})
export class ClientExtendActionsService {
  private actions: ClientExtendAction[] = [];

  constructor(private router: Router) {
    this.initializeDefaultActions();
  }

  /**
   * Initialize default extend actions
   */
  private initializeDefaultActions(): void {
    // KYC Management Action - Available for all clients
    this.registerAction({
      name: 'View KYC',
      icon: 'security',
      route: '/clients',
      condition: (clientData: any) => true
    });

    // Guarantor KYC Management Action - Available for all clients
    this.registerAction({
      name: 'Guarantor KYC',
      icon: 'users',
      route: '/clients',
      condition: (clientData: any) => true
    });

    // Credit Report Action - Available for all clients
    this.registerAction({
      name: 'View Credit Report',
      icon: 'assessment',
      route: '/clients',
      condition: (clientData: any) => true
    });
  }

  /**
   * Register a new action
   */
  registerAction(action: ClientExtendAction): void {
    this.actions.push(action);
  }

  /**
   * Get available actions for a client
   */
  getAvailableActions(clientData: any): ClientExtendAction[] {
    const availableActions = this.actions.filter((action) => {
      if (action.condition) {
        const result = action.condition(clientData);
        return result;
      }
      return true;
    });

    return availableActions;
  }

  /**
   * Execute an action by name
   * Routes match the clientExtensionsRoutes structure from client-extensions-routing.module.ts
   */
  executeAction(actionName: string, clientId: number, route: ActivatedRoute): void {
    // Navigate to the correct extension routes
    if (actionName === 'View KYC') {
      this.router.navigate([
        '/clients',
        clientId,
        'kyc'
      ]);
    } else if (actionName === 'Guarantor KYC') {
      this.router.navigate([
        '/clients',
        clientId,
        'guarantor-kyc'
      ]);
    } else if (actionName === 'View Credit Report') {
      this.router.navigate([
        '/clients',
        clientId,
        'credit-report'
      ]);
    } else {
      console.error(`Unknown action: ${actionName}`);
    }
  }
}
