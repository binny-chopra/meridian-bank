import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, catchError, exhaustMap, of } from 'rxjs';

import { MAX_MEMO_LENGTH, MIN_TRANSFER_AMOUNT } from '../../../core/constants/transfers.constants';
import { CopyableValue } from '../../../shared/components/copyable-value/copyable-value';
import { MaskedAccountSelect } from '../../../shared/components/masked-account-select/masked-account-select';
import { AccountsApi } from '../../accounts/accounts-api';
import { accountActiveValidator, sameAccountValidator, sufficientFundsValidator } from '../account-validators';
import { TransferConfirmDialog } from '../transfer-confirm-dialog/transfer-confirm-dialog';
import { TransfersApi } from '../transfers-api';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

@Component({
  selector: 'app-transfers-page',
  imports: [ReactiveFormsModule, MaskedAccountSelect, TransferConfirmDialog, CopyableValue],
  templateUrl: './transfers-page.html',
  styleUrl: './transfers-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransfersPage {
  private readonly accountsApi = inject(AccountsApi);
  private readonly transfersApi = inject(TransfersApi);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly accounts = toSignal(this.accountsApi.getAccounts().pipe(catchError(() => of([]))), {
    initialValue: [],
  });

  protected readonly transferForm = this.fb.group(
    {
      fromAccountId: this.fb.control('', Validators.required),
      toAccountId: this.fb.control('', {
        validators: Validators.required,
        asyncValidators: accountActiveValidator(this.accounts),
      }),
      amount: this.fb.control(0, [Validators.required, Validators.min(MIN_TRANSFER_AMOUNT)]),
      memo: this.fb.control('', Validators.maxLength(MAX_MEMO_LENGTH)),
    },
    { validators: [sameAccountValidator, sufficientFundsValidator(this.accounts)] },
  );

  protected readonly fromAccount = computed(() =>
    this.accounts().find((account) => account.id === this.transferForm.controls.fromAccountId.value),
  );
  protected readonly toAccount = computed(() =>
    this.accounts().find((account) => account.id === this.transferForm.controls.toAccountId.value),
  );

  protected readonly showConfirmDialog = signal(false);
  protected readonly submitState = signal<SubmitState>('idle');
  protected readonly confirmationId = signal<string | null>(null);

  private readonly confirmClicks$ = new Subject<void>();
  private readonly submitButton = viewChild<ElementRef<HTMLButtonElement>>('submitButton');

  constructor() {
    // exhaustMap: while a submit is in flight, further clicks on "Confirm" are
    // dropped rather than queued or restarted — the one place in this app where
    // that matters, since queuing would mean submitting the same transfer twice.
    this.confirmClicks$
      .pipe(
        exhaustMap(() => {
          this.submitState.set('submitting');
          return this.transfersApi
            .submitTransfer(this.transferForm.getRawValue())
            .pipe(catchError(() => of({ success: false })));
        }),
        takeUntilDestroyed(),
      )
      .subscribe((result) => {
        this.showConfirmDialog.set(false);
        if (result.success) {
          this.submitState.set('success');
          this.confirmationId.set('confirmationId' in result ? (result.confirmationId ?? null) : null);
          this.transferForm.reset({ fromAccountId: '', toAccountId: '', amount: 0, memo: '' });
        } else {
          this.submitState.set('error');
        }
      });
  }

  protected reviewTransfer(): void {
    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      return;
    }
    this.submitState.set('idle');
    this.showConfirmDialog.set(true);
  }

  protected cancelConfirm(): void {
    this.showConfirmDialog.set(false);
    this.submitButton()?.nativeElement.focus();
  }

  protected confirmTransfer(): void {
    this.confirmClicks$.next();
  }
}
