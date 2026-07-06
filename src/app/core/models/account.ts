import type { AccountStatus } from '../../shared/components/badge/badge';

export type AccountType = 'checking' | 'savings' | 'credit';

export interface Account {
  id: string;
  nickname: string;
  type: AccountType;
  accountNumber: string;
  balance: number;
  currency: string;
  status: AccountStatus;
}
