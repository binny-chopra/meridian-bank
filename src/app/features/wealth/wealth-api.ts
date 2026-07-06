import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';

import { API_ENDPOINTS } from '../../core/api-endpoints';
import { QUOTE_JITTER_PERCENT } from '../../core/constants/wealth.constants';
import { Holding, HoldingWithQuote } from '../../core/models/holding';
import { Quote, SymbolDirectoryEntry } from '../../core/models/quote';

@Injectable({
  providedIn: 'root',
})
export class WealthApi {
  private readonly http = inject(HttpClient);

  getHoldingsWithQuotes(): Observable<HoldingWithQuote[]> {
    return forkJoin({
      holdings: this.getHoldings(),
      quotes: this.getQuotes(),
    }).pipe(map(({ holdings, quotes }) => this.joinHoldingsAndQuotes(holdings, quotes)));
  }

  searchSymbols(query: string): Observable<SymbolDirectoryEntry[]> {
    const normalized = query.trim().toLowerCase();
    return this.http.get<SymbolDirectoryEntry[]>(API_ENDPOINTS.symbols).pipe(
      map((entries) =>
        entries.filter(
          (entry) =>
            entry.symbol.toLowerCase().includes(normalized) ||
            entry.name.toLowerCase().includes(normalized),
        ),
      ),
    );
  }

  private getHoldings(): Observable<Holding[]> {
    return this.http.get<Holding[]>(API_ENDPOINTS.holdings);
  }

  private getQuotes(): Observable<Quote[]> {
    // The mock file only has a static baseline price. Each poll nudges it by a
    // small random walk so the feed feels live without a real market-data API.
    return this.http
      .get<Quote[]>(API_ENDPOINTS.quotes)
      .pipe(map((quotes) => quotes.map((quote) => this.withJitter(quote))));
  }

  private withJitter(quote: Quote): Quote {
    const driftPercent = (Math.random() - 0.5) * 2 * QUOTE_JITTER_PERCENT;
    const price = Number((quote.price * (1 + driftPercent / 100)).toFixed(2));
    return {
      ...quote,
      price,
      changePercent: Number((quote.changePercent + driftPercent).toFixed(2)),
      asOf: new Date().toISOString(),
    };
  }

  private joinHoldingsAndQuotes(holdings: Holding[], quotes: Quote[]): HoldingWithQuote[] {
    const quoteBySymbol = new Map(quotes.map((quote) => [quote.symbol, quote]));

    return holdings.map((holding) => {
      const quote = quoteBySymbol.get(holding.symbol);
      const price = quote?.price ?? 0;
      return {
        ...holding,
        price,
        changePercent: quote?.changePercent ?? 0,
        marketValue: Number((price * holding.shares).toFixed(2)),
        gainLoss: Number(((price - holding.costBasis) * holding.shares).toFixed(2)),
      };
    });
  }
}
