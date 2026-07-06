import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  Subject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  fromEvent,
  map,
  merge,
  of,
  scan,
  shareReplay,
  switchMap,
  timer,
} from 'rxjs';

import {
  QUOTE_POLL_INTERVAL_MS,
  SYMBOL_SEARCH_DEBOUNCE_MS,
  SYMBOL_SEARCH_MIN_LENGTH,
} from '../../../core/constants/wealth.constants';
import { HoldingWithQuote } from '../../../core/models/holding';
import { SymbolDirectoryEntry } from '../../../core/models/quote';
import { Button } from '../../../shared/components/button/button';
import { WatchlistStore } from '../watchlist-store';
import { WealthApi } from '../wealth-api';

interface PriceTrendState {
  previous: Map<string, number>;
  current: HoldingWithQuote[] | null;
}

@Component({
  selector: 'app-wealth-page',
  imports: [Button, CurrencyPipe],
  templateUrl: './wealth-page.html',
  styleUrl: './wealth-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WealthPage {
  private readonly api = inject(WealthApi);
  protected readonly watchlist = inject(WatchlistStore);

  private readonly manualRefresh$ = new Subject<void>();

  // Interval polling (timer + switchMap) merged with a manual "Refresh now"
  // trigger. shareReplay means the timer/HTTP pipeline runs once and is shared
  // by every consumer below (holdings, the trend tracker, and the watchlist
  // panel) instead of each spinning up its own independent poll loop.
  private readonly poll$ = merge(timer(0, QUOTE_POLL_INTERVAL_MS), this.manualRefresh$).pipe(
    switchMap(() => this.api.getHoldingsWithQuotes().pipe(catchError(() => of(null)))),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  // undefined = loading, null = request failed, array = loaded.
  protected readonly holdings = toSignal(this.poll$, { initialValue: undefined });

  // scan keeps the previous tick's prices around so each row can show
  // whether it moved up or down since the last poll.
  private readonly priceTrend = toSignal(
    this.poll$.pipe(
      scan<HoldingWithQuote[] | null, PriceTrendState>(
        (state, current) => ({
          previous: state.current ? new Map(state.current.map((h) => [h.symbol, h.price])) : state.previous,
          current,
        }),
        { previous: new Map<string, number>(), current: null },
      ),
    ),
    { initialValue: { previous: new Map<string, number>(), current: null } },
  );

  protected readonly watchedHoldings = toSignal(
    combineLatest([this.poll$, toObservable(this.watchlist.symbols)]).pipe(
      map(([holdings, watched]) =>
        holdings ? holdings.filter((h) => watched.has(h.symbol)) : holdings,
      ),
    ),
    { initialValue: undefined },
  );

  protected readonly searchText = signal('');
  protected readonly isOpen = signal(false);
  protected readonly activeIndex = signal(-1);

  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly combobox = viewChild<ElementRef<HTMLElement>>('combobox');

  protected readonly searchResults = toSignal(
    toObservable(this.searchText).pipe(
      debounceTime(SYMBOL_SEARCH_DEBOUNCE_MS),
      distinctUntilChanged(),
      switchMap((query) =>
        query.trim().length < SYMBOL_SEARCH_MIN_LENGTH
          ? of<SymbolDirectoryEntry[]>([])
          : this.api.searchSymbols(query).pipe(catchError(() => of<SymbolDirectoryEntry[]>([]))),
      ),
    ),
    { initialValue: [] },
  );

  protected readonly activeOptionId = computed(() => {
    const index = this.activeIndex();
    const results = this.searchResults();
    return index >= 0 && index < results.length ? `symbol-option-${results[index].symbol}` : null;
  });

  constructor() {
    // Closing the combobox on an outside click is a real side effect on the
    // document, not derived state — a manual subscription, cleaned up via
    // takeUntilDestroyed() instead of an RxJS-agnostic signal.
    fromEvent<MouseEvent>(document, 'click')
      .pipe(takeUntilDestroyed())
      .subscribe((event) => {
        const container = this.combobox()?.nativeElement;
        if (container && event.target instanceof Node && !container.contains(event.target)) {
          this.isOpen.set(false);
        }
      });
  }

  protected refreshNow(): void {
    this.manualRefresh$.next();
  }

  protected trendFor(symbol: string, price: number): 'up' | 'down' | 'flat' {
    const previous = this.priceTrend().previous.get(symbol);
    if (previous === undefined || previous === price) {
      return 'flat';
    }
    return price > previous ? 'up' : 'down';
  }

  protected formatChangePercent(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }

  protected onSearchInput(value: string): void {
    this.searchText.set(value);
    this.isOpen.set(true);
    this.activeIndex.set(-1);
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    const results = this.searchResults();
    if (!this.isOpen() || results.length === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.update((i) => (i + 1) % results.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update((i) => (i <= 0 ? results.length - 1 : i - 1));
        break;
      case 'Enter':
        event.preventDefault();
        if (this.activeIndex() >= 0) {
          this.selectSymbol(results[this.activeIndex()]);
        }
        break;
      case 'Escape':
        this.isOpen.set(false);
        this.activeIndex.set(-1);
        break;
    }
  }

  protected selectSymbol(entry: SymbolDirectoryEntry): void {
    this.watchlist.add(entry.symbol);
    this.searchText.set('');
    this.isOpen.set(false);
    this.activeIndex.set(-1);
    this.searchInput()?.nativeElement.focus();
  }
}
