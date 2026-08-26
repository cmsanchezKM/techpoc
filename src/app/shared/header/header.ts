import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { IconComponent } from '../icons/icon.component';
import { LanguageService } from '@core/services/language.service';
import { AuthService } from '@features/auth/data-access/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, IconComponent, TranslocoPipe],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class HeaderComponent {
  protected readonly lang = inject(LanguageService);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  changeLang(l: 'es' | 'en') {
    this.lang.use(l);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
