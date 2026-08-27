import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { TranslocoPipe } from '@jsverse/transloco';
import { IconComponent } from '../icons/icon.component';
import { LanguageService } from '@core/services/language.service';
import { AuthService } from '@features/auth/data-access/auth.service';
import { PostFilters } from '@features/posts/data-access/post-filters';

const POSTS_LIST_URL_PATTERN = /^\/posts(\?.*)?$/;

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
  protected readonly filters = inject(PostFilters);
  private readonly router = inject(Router);

  /** Sólo se muestra el buscador en la pantalla de listado de posts. */
  protected readonly isPostsListPage = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => POSTS_LIST_URL_PATTERN.test(event.urlAfterRedirects)),
      startWith(POSTS_LIST_URL_PATTERN.test(this.router.url)),
    ),
    { requireSync: true },
  );

  changeLang(l: 'es' | 'en') {
    this.lang.use(l);
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.filters.setSearchTerm(value);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  login() {
    this.router.navigate(['/login']);
  }
}
