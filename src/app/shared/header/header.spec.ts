import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { provideTransloco, TranslocoLoader } from '@jsverse/transloco';
import { of } from 'rxjs';
import { HeaderComponent } from './header';

class TranslocoLoaderMock implements TranslocoLoader {
  getTranslation() {
    return of({
      header: {
        title: 'TechPoC',
        logout: 'Salir',
        login: 'Entrar',
        languageSelector: 'Idioma',
        es: 'ES',
        en: 'EN',
      },
    });
  }
}

async function setup(overrides: Partial<{ showSearch: boolean; isAuthenticated: boolean }> = {}) {
  return render(HeaderComponent, {
    componentInputs: {
      showSearch: false,
      searchValue: '',
      searchPlaceholder: 'Buscar',
      searchAriaLabel: 'Buscar',
      currentLang: 'es',
      isAuthenticated: false,
      ...overrides,
    },
    providers: [
      provideRouter([]),
      provideTransloco({
        config: { availableLangs: ['es', 'en'], defaultLang: 'es' },
        loader: TranslocoLoaderMock,
      }),
    ],
  });
}

describe('HeaderComponent', () => {
  it('renders the brand title', async () => {
    await setup();

    expect(screen.getByText('TechPoC')).toBeInTheDocument();
  });

  it('emits langChange when a language button is clicked', async () => {
    const { fixture } = await setup();

    const emitted: string[] = [];
    fixture.componentInstance.langChange.subscribe((lang) => emitted.push(lang));

    screen.getByRole('button', { name: 'EN' }).click();

    expect(emitted).toEqual(['en']);
  });

  it('shows the logout button when authenticated', async () => {
    await setup({ isAuthenticated: true });

    expect(screen.getByRole('button', { name: 'Salir' })).toBeInTheDocument();
  });

  it('shows the login button when not authenticated', async () => {
    await setup({ isAuthenticated: false });

    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('only renders the search input when showSearch is true', async () => {
    const { rerender } = await setup({ showSearch: false });

    expect(screen.queryByPlaceholderText('Buscar')).not.toBeInTheDocument();

    await rerender({
      componentInputs: {
        showSearch: true,
        searchValue: '',
        searchPlaceholder: 'Buscar',
        searchAriaLabel: 'Buscar',
        currentLang: 'es',
        isAuthenticated: false,
      },
    });

    expect(screen.getByPlaceholderText('Buscar')).toBeInTheDocument();
  });

  it('emits searchChange when typing in the search input', async () => {
    const { fixture } = await setup({ showSearch: true });

    const emitted: string[] = [];
    fixture.componentInstance.searchChange.subscribe((value) => emitted.push(value));

    const input = screen.getByPlaceholderText('Buscar') as HTMLInputElement;
    input.value = 'angular';
    input.dispatchEvent(new Event('input'));

    expect(emitted).toEqual(['angular']);
  });
});
