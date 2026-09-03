import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { Lang } from '@core/services/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [TranslocoPipe],
  template: `
    <div
      class="inline-flex items-center bg-brand-tag rounded-2xl py-1.5 px-8 gap-8"
      [attr.aria-label]="'header.languageSelector' | transloco"
    >
      <button
        type="button"
        class="border-0 font-medium px-6 py-1 rounded-full cursor-pointer transition-all duration-200"
        [class]="
          current() === 'es' ? 'bg-brand-accent text-white' : 'bg-transparent text-brand-secondary'
        "
        (click)="langChange.emit('es')"
        [attr.aria-pressed]="current() === 'es'"
      >
        {{ 'header.es' | transloco }}
      </button>
      <button
        type="button"
        class="border-0 font-medium px-5 py-1 rounded-full cursor-pointer transition-all duration-200"
        [class]="
          current() === 'en' ? 'bg-brand-accent text-white' : 'bg-transparent text-brand-secondary'
        "
        (click)="langChange.emit('en')"
        [attr.aria-pressed]="current() === 'en'"
      >
        {{ 'header.en' | transloco }}
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class LanguageSwitcherComponent {
  readonly current = input.required<Lang>();
  readonly langChange = output<Lang>();
}
