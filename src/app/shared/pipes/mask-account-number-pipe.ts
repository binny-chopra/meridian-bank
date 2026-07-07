import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskAccountNumber',
})
export class MaskAccountNumberPipe implements PipeTransform {
  transform(accountNumber: string | null | undefined, visibleDigits = 4): string {
    if (!accountNumber) {
      return '';
    }

    const visible = accountNumber.slice(-visibleDigits);
    return `••••••••${visible}`;
  }
}
