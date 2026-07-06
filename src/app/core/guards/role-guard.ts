import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { UserRole } from '../models/auth-user';
import { Auth } from '../services/auth';

// A factory rather than a plain CanActivateFn — the allowed roles differ per
// route, so each route gets its own configured guard: canActivate: [roleGuard(['advisor'])].
export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return (_route, state) => {
    const auth = inject(Auth);
    const router = inject(Router);

    const user = auth.currentUser();
    if (!user) {
      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    return allowedRoles.includes(user.role) ? true : router.createUrlTree(['/accounts']);
  };
}
