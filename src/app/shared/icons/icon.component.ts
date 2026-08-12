import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName = 'arrow-left' | 'arrow-right' | 'chevron-left' | 'chevron-right';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      [attr.class]="class()"
      [attr.aria-hidden]="ariaHidden()"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      @switch (name()) {
        @case ('arrow-left') {
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 12H5m0 0l7 7m-7-7l7-7" />
        }
        @case ('arrow-right') {
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m0 0l-7-7m7 7l-7 7" />
        }
        @case ('chevron-left') {
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        }
        @case ('chevron-right') {
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        }
      }
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex',
  },
})
export class IconComponent {
  name = input.required<IconName>();
  class = input('h-4 w-4');
  ariaHidden = input<boolean | 'true' | 'false'>('true');
}
