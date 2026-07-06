import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';

import { UserRole } from '../../core/models/auth-user';

@Directive({
  selector: '[appHasRole]',
})
export class HasRole {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainerRef = inject(ViewContainerRef);

  readonly appHasRole = input.required<UserRole[]>();
  readonly appHasRoleUser = input<UserRole | undefined>(undefined);

  private hasView = false;

  constructor() {
    effect(() => {
      const allowedRoles = this.appHasRole();
      const currentRole = this.appHasRoleUser();
      const shouldShow = !!currentRole && allowedRoles.includes(currentRole);

      if (shouldShow && !this.hasView) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (!shouldShow && this.hasView) {
        this.viewContainerRef.clear();
        this.hasView = false;
      }
    });
  }
}
