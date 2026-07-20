import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CardTitleComponent } from './card-title';

@Component({
  selector: 'app-card-header',
  template: `
    <header class="flex items-center justify-between">
      <app-card-title [title]="title()" />
      @if (date()) {
        <time
          [dateTime]="date()"
          class="text-sm font-medium uppercase tracking-wide text-brand-tertiary"
        >
          {{ date() | date: 'MMM yyyy' }}
        </time>
      }
    </header>
  `,
  standalone: true,
  imports: [CommonModule, DatePipe, CardTitleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardHeaderComponent {
  date = input<string | undefined>();
  title = input.required<string>();
}
