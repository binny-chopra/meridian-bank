import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { Auth } from './core/services/auth';
import { HasRole } from './shared/directives/has-role';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgOptimizedImage, HasRole],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly title = signal('meridian-bank');

  protected logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
