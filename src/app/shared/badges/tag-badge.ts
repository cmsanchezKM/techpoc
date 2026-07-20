import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TagVariant = 'default' | 'accent' | 'success' | 'warning' | 'error';

@Component({
  selector: 'app-tag-badge',
  template: `
    <span [class]="getTagClasses()" role="status">
      {{ tag() }}
    </span>
  `,
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-block',
  },
})
export class TagBadgeComponent {
  tag = input.required<string>();
  variant = input<TagVariant>('default');

  getTagClasses(): string {
    const baseClasses = 'rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wide';
    const variantClasses: Record<TagVariant, string> = {
      default: 'bg-brand-tag text-brand-secondary',
      accent: 'bg-blue-100 text-blue-700',
      success: 'bg-green-100 text-green-700',
      warning: 'bg-yellow-100 text-yellow-700',
      error: 'bg-red-100 text-red-700',
    };

    return `${baseClasses} ${variantClasses[this.variant()]}`;
  }
}
