import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenStore {
  readonly token = signal<string | null>(null);

  setToken(token: string | null): void {
    this.token.set(token);
  }
}
