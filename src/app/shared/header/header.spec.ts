import { render, screen } from '@testing-library/angular';
import { provideRouter, Router } from '@angular/router';
import { provideTransloco, TranslocoLoader } from '@jsverse/transloco';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { HeaderComponent } from './header';
import { LanguageService } from '@core/services/language.service';
import { AuthService } from '@features/auth/data-access/auth.service';
import { PostFilters } from '@features/posts/data-access/post-filters';

class TranslocoLoaderMock implements TranslocoLoader {
  getTranslation() {
    return of({
      header: { logout: 'Salir', login: 'Entrar', languageSelector: 'Idioma' },
      posts: { list: { placeholder: 'Buscar', search: 'Buscar' } },
    });
  }
}

async function setup(isAuthenticated = false) {
  const languageServiceMock = { current: signal('es'), use: vi.fn() };
  const authServiceMock = { isAuthenticated: signal(isAuthenticated), logout: vi.fn() };
  const postFiltersMock = { searchTerm: signal(''), setSearchTerm: vi.fn() };

  const result = await render(HeaderComponent, {
    providers: [
      provideRouter([]),
      provideTransloco({
        config: { availableLangs: ['es', 'en'], defaultLang: 'es' },
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

describe('HeaderComponent', () => {
  it('changes the language through LanguageService', async () => {
    const { languageServiceMock } = await setup();

    await screen.getByRole('button', { name: 'EN' }).click();

    expect(languageServiceMock.use).toHaveBeenCalledWith('en');
  });

  it('shows the logout button when authenticated and logs out', async () => {
    const { authServiceMock, navigateSpy } = await setup(true);

    screen.getByRole('button', { name: 'Salir' }).click();

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('shows the login button when not authenticated and navigates to /login', async () => {
    const { navigateSpy } = await setup(false);

    screen.getByRole('button', { name: 'Entrar' }).click();

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('forwards the search input to PostFilters', async () => {
    const { fixture, postFiltersMock } = await setup();

    fixture.componentInstance.onSearchInput({
      target: { value: 'angular' },
    } as unknown as Event);

    expect(postFiltersMock.setSearchTerm).toHaveBeenCalledWith('angular');
  });
});
