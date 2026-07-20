import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardHeaderComponent } from './card-header';
import { CardDescriptionComponent } from './card-description';
import { CardFooterComponent } from './card-footer';

@Component({
  selector: 'app-card',
  template: `
    <article
      [class]="
        'w-full rounded-lg p-8 shadow-xs transition hover:shadow-sm transition-transform hover:-translate-y-0.5 ' +
        styles()
      "
    >
      <app-card-header [date]="date()" [title]="title()" />
      <div class="mt-6 space-y-4">
        <app-card-description [description]="description()" />
      </div>
      <app-card-footer [author]="author()" [tags]="tags()" class="mt-8" />
    </article>
  `,
  standalone: true,
  imports: [CommonModule, CardHeaderComponent, CardDescriptionComponent, CardFooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  styles = input<string>();
  date = input.required<string>();
  title = input.required<string>();
  description = input.required<string>();
  author = input.required<string>();
  tags = input.required<string[]>();
}
