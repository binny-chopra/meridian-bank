import { Injectable } from '@angular/core';
import { Observable, map, timer } from 'rxjs';

import { TRANSFER_SUBMIT_DELAY_MS } from '../../core/constants/transfers.constants';
import { TransferRequest, TransferResult } from '../../core/models/transfer';

@Injectable({
  providedIn: 'root',
})
export class TransfersApi {
  submitTransfer(_request: TransferRequest): Observable<TransferResult> {
    // No real backend for transfers — this only simulates realistic submit latency.
    return timer(TRANSFER_SUBMIT_DELAY_MS).pipe(
      map(() => ({ success: true, confirmationId: this.generateConfirmationId() })),
    );
  }

  private generateConfirmationId(): string {
    return `CONF-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  }
}
