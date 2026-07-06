import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { authInterceptor } from './core/interceptors/auth-interceptor';
import { errorInterceptor } from './core/interceptors/error-interceptor';
import { retryInterceptor } from './core/interceptors/retry-interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    // Order is the request/response "onion": authInterceptor is outermost (attaches
    // the header on the way out); retryInterceptor sits innermost, closest to the
    // real backend call, so it sees raw transient failures and can retry them
    // transparently. errorInterceptor wraps that, so it only logs once retries
    // are exhausted, instead of once per retry.
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, retryInterceptor])),
  ]
};
