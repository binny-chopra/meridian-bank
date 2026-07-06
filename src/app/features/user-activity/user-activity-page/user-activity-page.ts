import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

import { UserActivityApi } from '../user-activity-api';

@Component({
  selector: 'app-user-activity-page',
  imports: [],
  templateUrl: './user-activity-page.html',
  styleUrl: './user-activity-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserActivityPage {
  private readonly api = inject(UserActivityApi);

  // undefined = still loading, null = request failed, array = loaded.
  // toSignal subscribes on creation and unsubscribes on destroy automatically,
  // so there's no manual subscribe()/takeUntilDestroyed() bookkeeping here.
  protected readonly activity = toSignal(
    this.api.getUserActivity().pipe(catchError(() => of(null))),
    { initialValue: undefined },
  );
}
