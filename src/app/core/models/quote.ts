export interface Quote {
  symbol: string;
  price: number;
  changePercent: number;
  asOf: string;
}

export interface SymbolDirectoryEntry {
  symbol: string;
  name: string;
}
