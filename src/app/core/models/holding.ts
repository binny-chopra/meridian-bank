export interface Holding {
  symbol: string;
  name: string;
  shares: number;
  costBasis: number;
}

export interface HoldingWithQuote extends Holding {
  price: number;
  changePercent: number;
  marketValue: number;
  gainLoss: number;
}
