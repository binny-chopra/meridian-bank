import { CurrencyPipe } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';

import { Transaction } from '../../../core/models/transaction';
import { AccountsApi } from '../accounts-api';

type SortColumn = 'date' | 'description' | 'amount';
type SortDirection = 'asc' | 'desc';

const FILTER_STORAGE_KEY = 'meridian:tx-filter';

@Component({
  selector: 'app-account-detail-page',
  imports: [CurrencyPipe, ScrollingModule, RouterLink],
  templateUrl: './account-detail-page.html',
  styleUrl: './account-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountDetailPage {
  private readonly api = inject(AccountsApi);

  // Bound automatically from the :id route param via withComponentInputBinding().
  readonly id = input.required<string>();

  private readonly id$ = toObservable(this.id);

  // undefined = loading, null = request failed, array = loaded.
  protected readonly transactions = toSignal(
    this.id$.pipe(
      switchMap((id) => this.api.getTransactions(id).pipe(catchError(() => of(null)))),
    ),
    { initialValue: undefined },
  );

  protected readonly filterText = signal(sessionStorage.getItem(FILTER_STORAGE_KEY) ?? '');
  protected readonly sortColumn = signal<SortColumn>('date');
  protected readonly sortDirection = signal<SortDirection>('desc');

  protected readonly visibleTransactions = computed(() => {
    const transactions = this.transactions();
    if (!transactions) {
      return [];
    }

    const query = this.filterText().trim().toLowerCase();
    const filtered = query
      ? transactions.filter(
          (t) =>
            t.description.toLowerCase().includes(query) || t.category.toLowerCase().includes(query),
        )
      : transactions;

    return this.sortTransactions(filtered);
  });

  constructor() {
    // A real side effect (talking to sessionStorage), not derived state —
    // that's why this is an effect() and not folded into the computed above.
    effect(() => {
      sessionStorage.setItem(FILTER_STORAGE_KEY, this.filterText());
    });
  }

  protected setSort(column: SortColumn): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update((direction) => (direction === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  protected ariaSortFor(column: SortColumn): 'ascending' | 'descending' | 'none' {
    if (this.sortColumn() !== column) {
      return 'none';
    }
    return this.sortDirection() === 'asc' ? 'ascending' : 'descending';
  }

  protected trackByTransactionId(_index: number, transaction: Transaction): string {
    return transaction.id;
  }

  private sortTransactions(transactions: Transaction[]): Transaction[] {
    const column = this.sortColumn();
    const direction = this.sortDirection() === 'asc' ? 1 : -1;

    return [...transactions].sort((a, b) => {
      switch (column) {
        case 'amount':
          return (a.amount - b.amount) * direction;
        case 'date':
          return a.date.localeCompare(b.date) * direction;
        case 'description':
          return a.description.localeCompare(b.description) * direction;
      }
    });
  }
}
