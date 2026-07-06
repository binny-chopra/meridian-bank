import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { Badge } from '../../../shared/components/badge/badge';
import { Card } from '../../../shared/components/card/card';
import { MaskAccountNumberPipe } from '../../../shared/pipes/mask-account-number-pipe';
import { AccountsApi } from '../accounts-api';

@Component({
  selector: 'app-accounts-list-page',
  imports: [RouterLink, Card, Badge, CurrencyPipe, MaskAccountNumberPipe],
  templateUrl: './accounts-list-page.html',
  styleUrl: './accounts-list-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsListPage {
  private readonly api = inject(AccountsApi);

  // undefined = loading, null = request failed, array = loaded.
  protected readonly accounts = toSignal(
    this.api.getAccounts().pipe(catchError(() => of(null))),
    { initialValue: undefined },
  );

  protected readonly netWorth = computed(() => {
    const accounts = this.accounts();
    if (!accounts) {
      return accounts;
    }
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  });
}
