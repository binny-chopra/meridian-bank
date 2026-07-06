import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, catchError, exhaustMap, of } from 'rxjs';

import { DEFAULT_LOGIN_REDIRECT } from '../../../core/constants/auth.constants';
import { Auth } from '../../../core/services/auth';
import { AutoFocus } from '../../../shared/directives/auto-focus';

interface Credentials {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, AutoFocus],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly loginForm = this.fb.group({
    username: this.fb.control('', Validators.required),
    password: this.fb.control('', Validators.required),
  });

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // takeUntilDestroyed() calls inject(DestroyRef) internally, which only works
  // in a constructor/field-initializer context — not inside a method invoked
  // later by a click handler. So the pipeline is built once here, and submit()
  // just pushes into it. exhaustMap also means a double-click on "Sign in"
  // can't fire a second login while the first is still in flight.
  private readonly submitAttempts$ = new Subject<Credentials>();

  constructor() {
    this.submitAttempts$
      .pipe(
        exhaustMap(({ username, password }) => {
          this.submitting.set(true);
          this.errorMessage.set(null);
          return this.auth.login(username, password).pipe(
            catchError((error: Error) => {
              this.errorMessage.set(error.message);
              this.submitting.set(false);
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((user) => {
        if (!user) {
          return;
        }
        this.submitting.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? DEFAULT_LOGIN_REDIRECT;
        this.router.navigateByUrl(returnUrl);
      });
  }

  protected submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.submitAttempts$.next(this.loginForm.getRawValue());
  }
}
