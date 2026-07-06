import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { Badge, AccountStatus } from '../../shared/components/badge/badge';
import { Button } from '../../shared/components/button/button';
import { Card } from '../../shared/components/card/card';
import { Toggle } from '../../shared/components/toggle/toggle';
import { AutoFocus } from '../../shared/directives/auto-focus';
import { HasRole } from '../../shared/directives/has-role';
import { MaskAccountNumberPipe } from '../../shared/pipes/mask-account-number-pipe';
import { TimeAgoPipe } from '../../shared/pipes/time-ago-pipe';

@Component({
  selector: 'app-ui-kit-demo',
  imports: [Button, Card, Badge, Toggle, AutoFocus, HasRole, MaskAccountNumberPipe, TimeAgoPipe],
  templateUrl: './ui-kit-demo.html',
  styleUrl: './ui-kit-demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiKitDemo {
  protected readonly isAdvisorView = signal(false);
  protected readonly currentRole = computed(() => (this.isAdvisorView() ? 'advisor' : 'customer'));

  protected readonly accountStatus = signal<AccountStatus>('active');
  protected readonly lastUpdated = signal(new Date());
}
