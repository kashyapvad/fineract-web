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
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { ClientExtendActionsService } from '../services/client-extend-actions.service';

/**
 * Client Extended Menu Component
 *
 * This component provides a fork-safe way to add extended menu items
 * without modifying upstream templates. It can be used as a standalone
 * component or integrated into existing menus.
 */
@Component({
  selector: 'mifosx-client-extended-menu',
  template: `
    <ng-container *ngIf="hasMenuItems()">
      <mat-divider></mat-divider>
      <button mat-menu-item *ngFor="let item of getMenuItems()" (click)="executeAction(item.name)">
        <span>{{ item.name }}</span>
      </button>
    </ng-container>
  `
})
export class ClientExtendedMenuComponent implements OnInit, OnChanges {
  @Input() clientData: any;

  private _menuItems: any[] = [];

  constructor(
    private extendActionsService: ClientExtendActionsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.updateMenuItems();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clientData']) {
      this.updateMenuItems();
    }
  }

  private updateMenuItems(): void {
    if (!this.clientData) {
      this._menuItems = [];
      return;
    }

    const availableActions = this.extendActionsService.getAvailableActions(this.clientData);
    this._menuItems = availableActions.map((action) => ({
      name: action.name,
      action: () => this.executeAction(action.name)
    }));
  }

  getMenuItems(): any[] {
    return this._menuItems;
  }

  executeAction(actionName: string): void {
    if (this.clientData?.id) {
      this.extendActionsService.executeAction(actionName, this.clientData.id, this.route);
    }
  }

  hasMenuItems(): boolean {
    return this._menuItems.length > 0;
  }
}
