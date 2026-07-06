import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'accounts',
  },
  {
    path: 'accounts',
    loadComponent: () =>
      import('./features/accounts/accounts-list-page/accounts-list-page').then(
        (m) => m.AccountsListPage,
      ),
  },
  {
    path: 'accounts/:id',
    loadComponent: () =>
      import('./features/accounts/account-detail-page/account-detail-page').then(
        (m) => m.AccountDetailPage,
      ),
  },
  {
    path: 'wealth',
    loadComponent: () =>
      import('./features/wealth/wealth-page/wealth-page').then((m) => m.WealthPage),
  },
  {
    path: 'ui-kit',
    loadComponent: () => import('./features/ui-kit-demo/ui-kit-demo').then((m) => m.UiKitDemo),
  },
  {
    path: 'user-activity',
    loadComponent: () =>
      import('./features/user-activity/user-activity-page/user-activity-page').then(
        (m) => m.UserActivityPage,
      ),
  },
];
