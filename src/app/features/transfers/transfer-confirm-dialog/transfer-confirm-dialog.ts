import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';

import { Account } from '../../../core/models/account';
import { AutoFocus } from '../../../shared/directives/auto-focus';
import { MaskAccountNumberPipe } from '../../../shared/pipes/mask-account-number-pipe';

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

@Component({
  selector: 'app-transfer-confirm-dialog',
  imports: [CurrencyPipe, MaskAccountNumberPipe, AutoFocus],
  templateUrl: './transfer-confirm-dialog.html',
  styleUrl: './transfer-confirm-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferConfirmDialog {
  readonly fromAccount = input<Account | undefined>(undefined);
  readonly toAccount = input<Account | undefined>(undefined);
  readonly amount = input.required<number>();
  readonly memo = input('');
  readonly pending = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly dialog = viewChild<ElementRef<HTMLElement>>('dialog');

  // Manual, minimal focus trap: Tab/Shift+Tab wrap inside the dialog instead
  // of escaping to the page behind it, and Escape closes it — the two pieces
  // of the WCAG modal dialog pattern that don't come for free from `role="dialog"`.
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.cancelled.emit();
      return;
    }
    if (event.key !== 'Tab') {
      return;
    }

    const container = this.dialog()?.nativeElement;
    if (!container) {
      return;
    }

    const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
