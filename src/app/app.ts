import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { TranslocoPipe } from '@jsverse/transloco';
import { HeaderComponent } from './shared/header/header';
import { LanguageService, Lang } from '@core/services/language.service';
import { AuthService } from '@features/auth/data-access/auth.service';
import { PostFilters } from '@features/posts/data-access/post-filters';

const POSTS_LIST_URL_PATTERN = /^\/posts(\?.*)?$/;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, TranslocoPipe],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-h-screen bg-brand-bg font-sans text-brand-title' },
})
export class App {
  private readonly lang = inject(LanguageService);
  private readonly auth = inject(AuthService);
  private readonly filters = inject(PostFilters);
  private readonly router = inject(Router);

  protected readonly currentLang = this.lang.current;
  protected readonly isAuthenticated = this.auth.isAuthenticated;
  protected readonly searchValue = this.filters.searchTerm;

  protected readonly showSearch = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => POSTS_LIST_URL_PATTERN.test(event.urlAfterRedirects)),
      startWith(POSTS_LIST_URL_PATTERN.test(this.router.url)),
    ),
    { requireSync: true },
  );

  onSearchChange(term: string) {
    this.filters.setSearchTerm(term);
  }

  onLangChange(l: Lang) {
    this.lang.use(l);
  }

  onLogin() {
    this.router.navigate(['/login']);
  }

  onLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
