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
import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { ClientExtendActionsService } from '../services/client-extend-actions.service';

/** Material Design Components - specific imports for menu items */
import { MatDivider } from '@angular/material/divider';
import { MatMenuItem } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Client Extended Menu Component
 *
 * This component provides a fork-safe way to add extended menu items
 * without modifying upstream templates. It can be used as a standalone
 * component or integrated into existing menus.
 */
@Component({
  selector: 'mifosx-client-extended-menu',
  templateUrl: './client-extended-menu.component.html',
  standalone: true,
  imports: [
    MatDivider,
    MatMenuItem,
    TranslateModule
  ]
})
export class ClientExtendedMenuComponent {
  @Input() clientData: any;

  constructor(
    private extendActionsService: ClientExtendActionsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  executeAction(actionName: string): void {
    if (this.clientData?.id) {
      // Use the extension service for proper navigation
      this.extendActionsService.executeAction(actionName, this.clientData.id, this.route);
    } else {
      console.error('Client data or client ID not available');
    }
  }
}
