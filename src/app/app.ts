import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Badge, AccountStatus } from './shared/components/badge/badge';
import { Button } from './shared/components/button/button';
import { Card } from './shared/components/card/card';
import { Toggle } from './shared/components/toggle/toggle';
import { AutoFocus } from './shared/directives/auto-focus';
import { HasRole } from './shared/directives/has-role';
import { MaskAccountNumberPipe } from './shared/pipes/mask-account-number-pipe';
import { TimeAgoPipe } from './shared/pipes/time-ago-pipe';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Button, Card, Badge, Toggle, AutoFocus, HasRole, MaskAccountNumberPipe, TimeAgoPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('meridian-bank');

  protected readonly isAdvisorView = signal(false);
  protected readonly currentRole = computed(() => (this.isAdvisorView() ? 'advisor' : 'customer'));

  protected readonly accountStatus = signal<AccountStatus>('active');
  protected readonly lastUpdated = signal(new Date());
}
