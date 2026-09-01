import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { provideTransloco, TranslocoLoader } from '@jsverse/transloco';
import { of } from 'rxjs';
import { ErrorPage } from './error-page';

class TranslocoLoaderMock implements TranslocoLoader {
  getTranslation() {
    return of({
      errors: {
        forbidden: { title: 'Acceso denegado', message: 'No tienes permiso.' },
        notFound: { title: 'Página no encontrada', message: 'No existe.' },
        serverError: { title: 'Error del servidor', message: 'Algo falló.' },
        backHome: 'Volver al inicio',
      },
    });
  }
}

function renderErrorPage(code?: 403 | 404 | 500) {
  return render(ErrorPage, {
    componentInputs: code !== undefined ? { code } : {},
    providers: [
      provideRouter([]),
      provideTransloco({
        config: { availableLangs: ['es', 'en'], defaultLang: 'es' },
        loader: TranslocoLoaderMock,
      }),
    ],
  });
}

describe('ErrorPage', () => {
  it('defaults to the 404 "not found" content', async () => {
    await renderErrorPage();

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument();
  });

  it('renders the 403 "forbidden" content', async () => {
    await renderErrorPage(403);

    expect(screen.getByText('403')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Acceso denegado' })).toBeInTheDocument();
  });

  it('renders the 500 "server error" content', async () => {
    await renderErrorPage(500);

    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Error del servidor' })).toBeInTheDocument();
  });

  it('renders a link back home', async () => {
    await renderErrorPage(404);

    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
  });
});
