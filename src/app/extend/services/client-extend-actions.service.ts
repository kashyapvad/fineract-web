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
 * Interface for extend actions
 */
export interface ExtendAction {
  name: string;
  icon: string;
  route: string;
  condition?: (clientData: any) => boolean;
}

/**
 * Client Extend Actions Service
 *
 * Provides extensible actions for client management without modifying upstream code.
 * Actions are dynamically registered and filtered based on client state.
 *
 * Following Angular Architecture KB:
 * - Service-based extension pattern
 * - Clean separation of concerns
 * - Type-safe action definitions
 */
@Injectable({
  providedIn: 'root'
})
export class ClientExtendActionsService {
  private actions: ExtendAction[] = [];

  constructor(private router: Router) {
    this.initializeDefaultActions();
  }

  /**
   * Initialize default extend actions
   */
  private initializeDefaultActions(): void {
    // KYC Management Action - Available for all clients (removed status restriction)
    this.registerAction({
      name: 'View KYC',
      icon: 'security',
      route: '/clients',
      condition: (clientData: any) => true // Available for all clients
    });

    // Credit Report Action - Available for all clients (removed status restriction)
    this.registerAction({
      name: 'View Credit Report',
      icon: 'assessment',
      route: '/clients',
      condition: (clientData: any) => true // Available for all clients
    });
  }

  /**
   * Register a new extend action
   */
  registerAction(action: ExtendAction): void {
    this.actions.push(action);
  }

  /**
   * Get all available actions for a client
   */
  getAvailableActions(clientData: any): ExtendAction[] {
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
   */
  executeAction(actionName: string, clientId: number, route: ActivatedRoute): void {
    const action = this.actions.find((a) => a.name === actionName);
    if (action) {
      // Navigate to the action route with client ID and specific sub-route
      if (actionName === 'View KYC') {
        this.router.navigate([
          action.route,
          clientId,
          'kyc'
        ]);
      } else if (actionName === 'View Credit Report') {
        this.router.navigate([
          action.route,
          clientId,
          'credit-report'
        ]);
      } else {
        this.router.navigate([
          action.route,
          clientId
        ]);
      }
    }
  }
}
