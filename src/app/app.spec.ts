import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { provideTransloco, TranslocoLoader } from '@jsverse/transloco';
import { of } from 'rxjs';
import { App } from './app';

class TranslocoLoaderMock implements TranslocoLoader {
  getTranslation() {
    return of({
      header: {
        languageSelector: 'Selector de idioma',
        login: 'Iniciar sesión',
      },
    });
  }
}

async function setup() {
  return render(App, {
    providers: [
      provideRouter([]),
      provideTransloco({
        config: {
          availableLangs: ['es', 'en'],
          defaultLang: 'es',
        },
        loader: TranslocoLoaderMock,
      }),
    ],
  });
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
});
