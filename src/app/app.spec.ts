import { render, screen } from '@testing-library/angular';
import { provideRouter, Router } from '@angular/router';
import { provideTransloco, TranslocoLoader } from '@jsverse/transloco';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { App } from './app';
import { LanguageService } from '@core/services/language.service';
import { AuthService } from '@features/auth/data-access/auth.service';
import { PostFilters } from '@features/posts/data-access/post-filters';

class TranslocoLoaderMock implements TranslocoLoader {
  getTranslation() {
    return of({
      header: {
        title: 'TechPoC',
        languageSelector: 'Selector de idioma',
        login: 'Iniciar sesión',
        es: 'ES',
        en: 'EN',
      },
    });
  }
}

async function setup() {
  const languageServiceMock = { current: signal('es'), use: vi.fn() };
  const authServiceMock = { isAuthenticated: signal(false), logout: vi.fn() };
  const postFiltersMock = { searchTerm: signal(''), setSearchTerm: vi.fn() };

  const result = await render(App, {
    providers: [
      provideRouter([{ path: 'posts', children: [] }]),
      provideTransloco({
        config: {
          availableLangs: ['es', 'en'],
          defaultLang: 'es',
        },
        loader: TranslocoLoaderMock,
      }),
      { provide: LanguageService, useValue: languageServiceMock },
      { provide: AuthService, useValue: authServiceMock },
      { provide: PostFilters, useValue: postFiltersMock },
    ],
  });

  const navigateSpy = vi.spyOn(result.fixture.debugElement.injector.get(Router), 'navigate');

  return { ...result, languageServiceMock, authServiceMock, postFiltersMock, navigateSpy };
}

describe('App', () => {
  it('should create the app', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render header brand', async () => {
    await setup();
    expect(screen.getByText('TechPoC')).toBeInTheDocument();
  });

  it('changes the language through LanguageService', async () => {
    const { languageServiceMock } = await setup();

    screen.getByRole('button', { name: 'EN' }).click();

    expect(languageServiceMock.use).toHaveBeenCalledWith('en');
  });

  it('navigates to /login when the login button is clicked', async () => {
    const { navigateSpy } = await setup();

    screen.getByRole('button', { name: 'Iniciar sesión' }).click();

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('shows the search input only on the posts list route', async () => {
    const { fixture } = await setup();

    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();

    await fixture.debugElement.injector.get(Router).navigateByUrl('/posts');
    fixture.detectChanges();

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('forwards the search input to PostFilters', async () => {
    const { fixture, postFiltersMock } = await setup();

    await fixture.debugElement.injector.get(Router).navigateByUrl('/posts');
    fixture.detectChanges();

    const input = screen.getByRole('searchbox') as HTMLInputElement;
    input.value = 'angular';
    input.dispatchEvent(new Event('input'));

    expect(postFiltersMock.setSearchTerm).toHaveBeenCalledWith('angular');
  });
});
