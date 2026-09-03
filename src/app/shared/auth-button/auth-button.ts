import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { IconComponent } from '../icons/icon.component';

@Component({
  selector: 'app-auth-button',
  standalone: true,
  imports: [IconComponent, TranslocoPipe],
  template: `
    <div class="inline-flex items-center">
      @if (isAuthenticated()) {
        <button
          type="button"
          class="inline-flex items-center gap-4 bg-transparent text-brand-primary cursor-pointer p-0"
          [attr.aria-label]="'header.logout' | transloco"
          (click)="logout.emit()"
        >
          <app-icon name="log" viewBox="0 0 18 18" class="h-6 w-6" />
          <span class="font-semibold text-lg leading-none">{{ 'header.logout' | transloco }}</span>
        </button>
      } @else {
        <button
          type="button"
          class="inline-flex items-center gap-4 bg-transparent text-brand-primary cursor-pointer p-0"
          [attr.aria-label]="'header.login' | transloco"
          (click)="login.emit()"
        >
          <app-icon name="log" viewBox="0 0 18 18" class="h-6 w-6" />
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class AuthButtonComponent {
  readonly isAuthenticated = input.required<boolean>();

  readonly login = output<void>();
  readonly logout = output<void>();
}
