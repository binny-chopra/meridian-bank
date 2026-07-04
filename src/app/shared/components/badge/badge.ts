import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type AccountStatus = 'active' | 'pending' | 'closed';

@Component({
  selector: 'app-badge',
  imports: [],
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Badge {
  readonly status = input.required<AccountStatus>();
}
