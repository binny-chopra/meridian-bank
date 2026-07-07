import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { CopyToClipboard } from '../../directives/copy-to-clipboard';

// appCopyToClipboard is applied directly to the icon <button> in the
// template below, not composed via hostDirectives — only the icon should be
// the interactive/copyable target, not the value text next to it, and
// hostDirectives always applies to this component's whole host element.
@Component({
  selector: 'app-copyable-value',
  imports: [CopyToClipboard],
  templateUrl: './copyable-value.html',
  styleUrl: './copyable-value.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopyableValue {
  readonly value = input.required<string>();
}
