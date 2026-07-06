import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Account } from '../../../core/models/account';
import { MaskAccountNumberPipe } from '../../pipes/mask-account-number-pipe';

let nextInstanceId = 0;

@Component({
  selector: 'app-masked-account-select',
  imports: [MaskAccountNumberPipe],
  templateUrl: './masked-account-select.html',
  styleUrl: './masked-account-select.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MaskedAccountSelect),
      multi: true,
    },
  ],
})
export class MaskedAccountSelect implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly accounts = input.required<Account[]>();

  // <label for> can't point at this component's host tag, since the browser
  // has no idea it wraps a native <select> — so the control owns its own
  // label/select pair internally, keyed by a per-instance id.
  protected readonly selectId = `masked-account-select-${nextInstanceId++}`;

  protected readonly value = signal('');
  protected readonly disabled = signal(false);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected onSelect(value: string): void {
    this.value.set(value);
    this.onChange(value);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}
