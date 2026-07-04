import { Directive, signal } from '@angular/core';

@Directive({
  selector: '[appHighlightable]',
  host: {
    '[class.is-highlighted]': 'highlighted()',
    '(mouseenter)': 'highlighted.set(true)',
    '(mouseleave)': 'highlighted.set(false)',
    '(focusin)': 'highlighted.set(true)',
    '(focusout)': 'highlighted.set(false)',
  },
})
export class Highlightable {
  protected readonly highlighted = signal(false);
}
