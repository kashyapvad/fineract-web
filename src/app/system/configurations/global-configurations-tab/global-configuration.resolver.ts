/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../../system.service';

/**
 * Configurations data resolver.
 */
@Injectable()
export class GlobalConfigurationResolver {
  /**
   * @param {SystemService} systemService System service.
   */
  constructor(private systemService: SystemService) {}

  /**
   * Returns the Configuration data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const configurationId = route.paramMap.get('id');
    return this.systemService.getConfiguration(configurationId);
  }
}
