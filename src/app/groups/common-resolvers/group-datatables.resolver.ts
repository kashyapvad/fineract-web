/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { GroupsService } from '../groups.service';

/**
 * Group Datatables data resolver.
 */
@Injectable()
export class GroupDatatablesResolver {
  /**
   * @param {GroupsService} GroupsService Groups service.
   */
  constructor(private groupsService: GroupsService) {}

  /**
   * Returns the Group's Datatables data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.groupsService.getGroupDatatables();
  }
}
