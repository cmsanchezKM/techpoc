import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-description',
  template: `
    <p class="text-lg leading-relaxed text-brand-secondary">
      {{ description() }}
    </p>
  `,
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardDescriptionComponent {
  description = input.required<string>();
}
