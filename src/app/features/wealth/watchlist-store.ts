import { Injectable, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { WATCHLIST_STORAGE_KEY } from '../../core/constants/wealth.constants';
import { Auth } from '../../core/services/auth';

function loadStoredSymbols(): ReadonlySet<string> {
  try {
    const raw = sessionStorage.getItem(WATCHLIST_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

@Injectable({
  providedIn: 'root',
})
export class WatchlistStore {
  private readonly _symbols = signal<ReadonlySet<string>>(loadStoredSymbols());
  readonly symbols = this._symbols.asReadonly();

  constructor() {
    effect(() => {
      sessionStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify([...this._symbols()]));
    });

    // A different user logging in on the same tab shouldn't see whoever was
    // logged in before them still watching their symbols.
    inject(Auth)
      .loggedOut$.pipe(takeUntilDestroyed())
      .subscribe(() => this.clear());
  }

  isWatched(symbol: string): boolean {
    return this._symbols().has(symbol);
  }

  clear(): void {
    this._symbols.set(new Set());
  }

  add(symbol: string): void {
    this._symbols.update((current) => new Set(current).add(symbol));
  }

  remove(symbol: string): void {
    this._symbols.update((current) => {
      const next = new Set(current);
      next.delete(symbol);
      return next;
    });
  }

  toggle(symbol: string): void {
    if (this.isWatched(symbol)) {
      this.remove(symbol);
    } else {
      this.add(symbol);
    }
  }
}
