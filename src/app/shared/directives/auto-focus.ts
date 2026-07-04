import {
  AfterViewInit,
  Directive,
  ElementRef,
  Renderer2,
  booleanAttribute,
  inject,
  input,
} from '@angular/core';

@Directive({
  selector: '[appAutoFocus]',
})
export class AutoFocus implements AfterViewInit {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);

  readonly appAutoFocus = input(true, { transform: booleanAttribute });

  ngAfterViewInit(): void {
    if (!this.appAutoFocus()) {
      return;
    }

    // Renderer2.selectRootElement resolves the element and focuses it for us,
    // so this stays platform-abstracted instead of reaching for nativeElement.focus().
    this.renderer.selectRootElement(this.host.nativeElement, true);
  }
}
