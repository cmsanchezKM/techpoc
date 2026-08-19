import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  'arrow-left' | 'arrow-right' | 'chevron-left' | 'chevron-right' | 'pencil' | 'trash';

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
        @case ('pencil') {
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
          />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 19.5H4.5" />
        }
        @case ('trash') {
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
          />
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
