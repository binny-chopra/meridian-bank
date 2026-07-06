import { Injectable, effect, signal } from '@angular/core';

import { WATCHLIST_STORAGE_KEY } from '../../core/constants/wealth.constants';

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
  }

  isWatched(symbol: string): boolean {
    return this._symbols().has(symbol);
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
