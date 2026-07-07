import { DestroyRef, Directive, inject, input, signal } from '@angular/core';

const COPIED_RESET_DELAY_MS = 1500;

// Takes the text to copy as an input rather than reading the host's
// textContent — scraping rendered DOM text is fragile the moment a sibling
// element (like a "Copied" hint) adds its own text node to the same host.
// Meant to be applied to a real <button>, so focus/keyboard activation
// (Enter and Space both fire `click` on a native button) come free from the
// browser instead of being hand-rolled with role/tabindex/keydown handlers.
@Directive({
  selector: '[appCopyToClipboard]',
  host: {
    'aria-label': 'Copy to clipboard',
    '[class.copied]': 'copied()',
    '(click)': 'copy()',
  },
})
export class CopyToClipboard {
  readonly appCopyToClipboard = input.required<string>();

  private resetTimer?: ReturnType<typeof setTimeout>;
  protected readonly copied = signal(false);

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.resetTimer));
  }

  protected copy(): void {
    const text = this.appCopyToClipboard().trim();
    if (!text || !navigator.clipboard) {
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      this.copied.set(true);
      clearTimeout(this.resetTimer);
      this.resetTimer = setTimeout(() => this.copied.set(false), COPIED_RESET_DELAY_MS);
    });
  }
}
