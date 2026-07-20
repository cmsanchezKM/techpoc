import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Author {
  name: string;
  initials: string;
}

@Component({
  selector: 'app-author-badge',
  template: `
    <div class="flex items-center gap-3">
      <!-- Avatar con iniciales -->
      <div
        class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-sm font-semibold text-blue-700"
        role="img"
        [attr.aria-label]="'Avatar de ' + author().name"
      >
        {{ author().initials }}
      </div>
      <!-- Nombre del autor -->
      <span class="text-base font-medium text-gray-900">
        {{ author().name }}
      </span>
    </div>
  `,
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
})
export class AuthorBadgeComponent {
  author = input.required<Author>();
}
