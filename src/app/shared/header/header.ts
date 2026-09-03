import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { SearchInputComponent } from '../search-input/search-input';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher';
import { AuthButtonComponent } from '../auth-button/auth-button';
import { Lang } from '@core/services/language.service';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    TranslocoPipe,
    SearchInputComponent,
    LanguageSwitcherComponent,
    AuthButtonComponent,
  ],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class HeaderComponent {
  readonly showSearch = input(false);
  readonly searchValue = input('');
  readonly searchPlaceholder = input('');
  readonly searchAriaLabel = input('');
  readonly currentLang = input.required<Lang>();
  readonly isAuthenticated = input.required<boolean>();

  readonly searchChange = output<string>();
  readonly langChange = output<Lang>();
  readonly login = output<void>();
  readonly logout = output<void>();
}
