import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

interface SelectOption {
  value: string | null;
  label: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <select
        [id]="id"
        class="appearance-none w-full rounded-sm border-0 bg-slate-100 px-4 py-2.5 pr-10 text-sm text-slate-700 transition duration-200 hover:bg-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        [value]="selectedValue() ?? ''"
        (change)="onChange($event)"
        [attr.aria-label]="label()"
      >
        <option [value]="''">{{ label() }}</option>
        @for (option of options(); track option.value ?? option.label) {
          <option [value]="option.value ?? ''">{{ option.label }}</option>
        }
      </select>

      <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
          />
        </svg>
      </span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
})
export class SelectComponent {
  readonly label = input<string>('');
  readonly options = input<SelectOption[]>([]);
  readonly selectedValue = input<string | null>(null);

  readonly valueChange = output<string | null>();

  readonly id = `app-select-${Math.random().toString(36).slice(2, 8)}`;

  onChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.valueChange.emit(value === '' ? null : value);
  }
}
