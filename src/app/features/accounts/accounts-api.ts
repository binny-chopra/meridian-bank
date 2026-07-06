import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_ENDPOINTS } from '../../core/api-endpoints';
import { Account } from '../../core/models/account';
import { Transaction } from '../../core/models/transaction';

@Injectable({
  providedIn: 'root',
})
export class AccountsApi {
  private readonly http = inject(HttpClient);

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(API_ENDPOINTS.accounts);
  }

  getTransactions(accountId: string): Observable<Transaction[]> {
    // The mock is a single flat file, so the accountId filter happens
    // client-side here; a real backend would take it as a query param
    // instead (the same HttpParams pattern used in UserActivityApi).
    return this.http
      .get<Transaction[]>(API_ENDPOINTS.transactions)
      .pipe(map((transactions) => transactions.filter((t) => t.accountId === accountId)));
  }
}
