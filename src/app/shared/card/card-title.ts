import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-title',
  template: `
    <h2 class="text-3xl tracking-tighter font-bold text-brand-primary">
      {{ title() }}
    </h2>
  `,
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardTitleComponent {
  title = input.required<string>();
}
