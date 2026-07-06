export interface TransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  memo: string;
}

export interface TransferResult {
  success: boolean;
  confirmationId?: string;
}
