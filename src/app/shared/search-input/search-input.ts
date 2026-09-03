import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '../icons/icon.component';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="bg-brand-surface border border-brand-line flex items-center px-4 py-4 rounded w-90">
      <app-icon
        name="search"
        stroke-width="0"
        viewBox="-2 -2 15 15"
        class="h-5 w-5 shrink-0 text-brand-secondary pointer-events-none"
      />
      <input
        type="search"
        class="w-full pl-3 bg-transparent border-0 text-sm text-brand-secondary placeholder:text-brand-secondary focus:outline-none"
        [value]="value()"
        (input)="onInput($event)"
        [placeholder]="placeholder()"
        [attr.aria-label]="ariaLabel()"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class SearchInputComponent {
  readonly value = input('');
  readonly placeholder = input('');
  readonly ariaLabel = input('');

  readonly valueChange = output<string>();

  onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }
}
