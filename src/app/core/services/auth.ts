import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, delay, map, of, throwError } from 'rxjs';

import { AUTH_USER_STORAGE_KEY, LOGIN_SIMULATED_DELAY_MS } from '../constants/auth.constants';
import { AuthUser } from '../models/auth-user';
import { TokenStore } from './token-store';

interface DemoAccount {
  username: string;
  password: string;
  user: AuthUser;
}

// Stand-in for a real backend's credential check — a real login always posts
// to a server; these credentials never leave the browser.
const DEMO_ACCOUNTS: DemoAccount[] = [
  { username: 'customer', password: 'demo', user: { id: 'usr-1', name: 'Jamie Rivera', role: 'customer' } },
  { username: 'advisor', password: 'demo', user: { id: 'usr-2', name: 'Ashley Wood', role: 'advisor' } },
];

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly tokenStore = inject(TokenStore);

  private readonly _currentUser = signal<AuthUser | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  constructor() {
    const restored = this.restoreUser();
    if (restored) {
      this._currentUser.set(restored);
      this.tokenStore.setToken(this.createFakeToken(restored));
    }
  }

  login(username: string, password: string): Observable<AuthUser> {
    const account = DEMO_ACCOUNTS.find(
      (a) => a.username === username.trim().toLowerCase() && a.password === password,
    );

    if (!account) {
      return throwError(() => new Error('Invalid username or password')).pipe(
        delay(LOGIN_SIMULATED_DELAY_MS),
      );
    }

    return of(account.user).pipe(
      delay(LOGIN_SIMULATED_DELAY_MS),
      map((user) => {
        this._currentUser.set(user);
        this.tokenStore.setToken(this.createFakeToken(user));
        sessionStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
        return user;
      }),
    );
  }

  logout(): void {
    this._currentUser.set(null);
    this.tokenStore.setToken(null);
    sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
  }

  private restoreUser(): AuthUser | null {
    try {
      const raw = sessionStorage.getItem(AUTH_USER_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }

  private createFakeToken(user: AuthUser): string {
    // Not a real JWT — just a readable stand-in so authInterceptor has
    // something to attach. A real login returns a signed token from the server.
    return `demo.${btoa(JSON.stringify({ sub: user.id, role: user.role }))}`;
  }
}
