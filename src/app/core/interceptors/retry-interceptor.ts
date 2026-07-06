import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { retry, timer } from 'rxjs';

import { HTTP_RETRY_BASE_DELAY_MS, HTTP_RETRY_COUNT } from '../constants/http.constants';

function isClientError(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status >= 400 && error.status < 500;
}

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  // Only GET requests are safe to retry blindly — retrying a POST/PATCH
  // could double-submit a transfer if the first attempt actually succeeded.
  if (req.method !== 'GET') {
    return next(req);
  }

  return next(req).pipe(
    retry({
      count: HTTP_RETRY_COUNT,
      delay: (error: unknown, retryCount: number) => {
        if (isClientError(error)) {
          throw error;
        }
        return timer(HTTP_RETRY_BASE_DELAY_MS * 2 ** (retryCount - 1));
      },
    }),
  );
};
