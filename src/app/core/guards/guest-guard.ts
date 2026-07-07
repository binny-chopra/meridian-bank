import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { DEFAULT_LOGIN_REDIRECT } from '../constants/auth.constants';
import { Auth } from '../services/auth';

// The inverse of authGuard: keeps an already-logged-in user from landing back
// on the login form (e.g. hitting Back, or a stale bookmark). Honors a
// returnUrl if one happens to be present, same as LoginPage does post-login,
// otherwise sends them to the default homepage.
export const guestGuard: CanActivateFn = (route) => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return true;
  }

  const returnUrl = route.queryParamMap.get('returnUrl') ?? DEFAULT_LOGIN_REDIRECT;
  return router.createUrlTree([returnUrl]);
};
