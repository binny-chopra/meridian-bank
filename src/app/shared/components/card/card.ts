import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Highlightable } from '../../directives/highlightable';

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [Highlightable],
})
export class Card {}
