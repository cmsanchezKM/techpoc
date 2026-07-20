import { Component, input, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthorBadgeComponent, TagBadgeComponent } from '../badges';
// Importar desde: src/app/shared/components/badges/index.ts

export interface Author {
  name: string;
  initials: string;
}

@Component({
  selector: 'app-card-footer',
  template: `
    <footer class="flex items-center justify-between pt-6">
      <!-- Autor -->
      <app-author-badge [author]="nameAndInitials()" />

      <!-- Tags -->
      <div class="flex gap-2" role="list">
        @for (tag of tags(); track tag) {
          <app-tag-badge [tag]="tag" role="listitem" />
        }
      </div>
    </footer>
  `,
  standalone: true,
  imports: [CommonModule, AuthorBadgeComponent, TagBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardFooterComponent {
  author = input.required<string>();
  tags = input.required<string[]>();

  nameAndInitials = computed<Author>(() => {
    const fullName = this.author().trim();

    const words = fullName.split(/\s+/);

    let initials = '';
    if (words.length > 0 && words[0] !== '') {
      initials += words[0][0];

      if (words.length > 1) {
        initials += words[1][0];
      }
    }

    return {
      name: fullName,
      initials: initials.toUpperCase(),
    };
  });
}
