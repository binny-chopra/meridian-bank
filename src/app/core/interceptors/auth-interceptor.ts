import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AUTH_HEADER_NAME } from '../constants/http.constants';
import { TokenStore } from '../services/token-store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenStore).token();

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { [AUTH_HEADER_NAME]: `Bearer ${token}` },
    }),
  );
};
