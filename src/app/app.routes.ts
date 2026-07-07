import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'accounts',
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'accounts',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/accounts/accounts-list-page/accounts-list-page').then(
        (m) => m.AccountsListPage,
      ),
  },
  {
    path: 'accounts/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/accounts/account-detail-page/account-detail-page').then(
        (m) => m.AccountDetailPage,
      ),
  },
  {
    path: 'wealth',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/wealth/wealth-page/wealth-page').then((m) => m.WealthPage),
  },
  {
    path: 'transfers',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/transfers/transfers-page/transfers-page').then((m) => m.TransfersPage),
  },
  {
    path: 'ui-kit',
    canActivate: [authGuard],
    loadComponent: () => import('./features/ui-kit-demo/ui-kit-demo').then((m) => m.UiKitDemo),
  },
  {
    path: 'user-activity',
    // Advisor-only: a customer has no reason to see a directory of other
    // users' activity — that's an internal/advisor oversight view.
    canActivate: [authGuard, roleGuard(['advisor'])],
    loadComponent: () =>
      import('./features/user-activity/user-activity-page/user-activity-page').then(
        (m) => m.UserActivityPage,
      ),
  },
];
