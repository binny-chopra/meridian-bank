import { environment } from '../../environments/environment';
import { API_BASE_URL } from './constants/api.constants';

function api(path: string, mockFile: string): string {
  return environment.useMock ? `/mock/${mockFile}.json` : `${API_BASE_URL}/${path}`;
}

export const API_ENDPOINTS = {
  users: api('users', 'users'),
  posts: api('posts', 'posts'),
  // Accounts/transactions have no live vendor backend — they're always served
  // from the local mock, regardless of the useMock toggle above.
  accounts: '/mock/accounts.json',
  transactions: '/mock/transactions.json',
  holdings: '/mock/holdings.json',
  quotes: '/mock/quotes.json',
  symbols: '/mock/symbols.json',
} as const;
