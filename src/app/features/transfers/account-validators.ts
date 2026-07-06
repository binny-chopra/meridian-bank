import { Signal } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, map, of, timer } from 'rxjs';

import { ACCOUNT_CHECK_DELAY_MS } from '../../core/constants/transfers.constants';
import { Account } from '../../core/models/account';

export function sameAccountValidator(group: AbstractControl): ValidationErrors | null {
  const from = group.get('fromAccountId')?.value;
  const to = group.get('toAccountId')?.value;
  return from && to && from === to ? { sameAccount: true } : null;
}

export function sufficientFundsValidator(accounts: Signal<Account[]>): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const fromId = group.get('fromAccountId')?.value;
    const amount = group.get('amount')?.value;
    if (!fromId || !amount) {
      return null;
    }

    const fromAccount = accounts().find((account) => account.id === fromId);
    if (!fromAccount) {
      return null;
    }

    return amount <= fromAccount.balance ? null : { insufficientFunds: true };
  };
}

export function accountActiveValidator(accounts: Signal<Account[]>): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const accountId = control.value;
    if (!accountId) {
      return of(null);
    }

    // Simulates a server-side eligibility check with realistic latency;
    // reuses the already-loaded accounts signal instead of a duplicate HTTP call.
    return timer(ACCOUNT_CHECK_DELAY_MS).pipe(
      map(() => {
        const account = accounts().find((a) => a.id === accountId);
        return account && account.status === 'active' ? null : { inactiveAccount: true };
      }),
    );
  };
}
