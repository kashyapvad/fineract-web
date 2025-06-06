/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * Fixed deposits account actions component.
 */
@Component({
  selector: 'mifosx-fixed-deposits-account-actions',
  templateUrl: './fixed-deposits-account-actions.component.html',
  styleUrls: ['./fixed-deposits-account-actions.component.scss']
})
export class FixedDepositsAccountActionsComponent {
  /** Flag object to store possible actions and render appropriate UI to the user */
  actions: {
    Approve: boolean;
    Reject: boolean;
    Activate: boolean;
    Close: boolean;
    'Undo Approval': boolean;
    'Undo Activation': boolean;
    'Add Charge': boolean;
    'Premature Close': boolean;
    'Withdrawn by Client': boolean;
    Withdrawal: boolean;
  } = {
    Approve: false,
    Reject: false,
    Activate: false,
    Close: false,
    'Undo Approval': false,
    'Undo Activation': false,
    'Add Charge': false,
    'Premature Close': false,
    'Withdrawn by Client': false,
    Withdrawal: false
  };

  /**
   * @param {ActivatedRoute} route Activated Route
   */
  constructor(private route: ActivatedRoute) {
    const name = this.route.snapshot.params['name'];
    if (name && name in this.actions) {
      this.actions[name as keyof typeof this.actions] = true;
    }
  }
}
