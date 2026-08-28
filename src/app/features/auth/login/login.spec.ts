import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { signal } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { provideTransloco, TranslocoLoader } from '@jsverse/transloco';
import { of } from 'rxjs';

import { Login } from './login';
import { AuthService } from '../data-access/auth.service';

class TranslocoLoaderMock implements TranslocoLoader {
  getTranslation() {
    return of({
      auth: {
        login: {
          title: 'Bienvenido',
          subtitle: 'Introduce tus credenciales',
          username: 'Usuario',
          usernamePlaceholder: 'Usuario',
          password: 'Contrasena',
          passwordPlaceholder: '********',
          submit: 'Acceder',
          submitAriaLabel: 'Acceder al sistema',
          loading: 'Cargando...',
          help: {
            title: 'Ayuda',
            message: 'Usa el nombre de usuario como contrasena',
          },
        },
      },
    });
  }
}

describe('Login', () => {
  let authServiceMock: {
    loading: ReturnType<typeof signal<boolean>>;
    error: ReturnType<typeof signal<string | null>>;
    login: ReturnType<typeof vi.fn>;
    clearError: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authServiceMock = {
      loading: signal(false),
      error: signal<string | null>(null),
      login: vi.fn(async () => ({ token: 'mock-jwt-token-1234567890' })),
      clearError: vi.fn(),
    };
  });

  async function setup() {
    const user = userEvent.setup();
    const result = await render(Login, {
      providers: [
        provideRouter([]),
        provideTransloco({
          config: {
            availableLangs: ['es', 'en'],
            defaultLang: 'es',
          },
          loader: TranslocoLoaderMock,
        }),
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    });
    const router = result.fixture.debugElement.injector.get(Router);
    return { ...result, user, router };
  }

  async function fillForm(
    user: ReturnType<typeof userEvent.setup>,
    username: string,
    password: string,
  ) {
    await user.type(screen.getByLabelText('Usuario'), username);
    await user.type(screen.getByLabelText('Contrasena'), password);
  }

  it('should create', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should disable the submit button when the form is empty', async () => {
    await setup();
    expect(screen.getByRole('button', { name: 'Acceder al sistema' })).toBeDisabled();
  });

  it('should enable the submit button once both fields are filled', async () => {
    const { user } = await setup();
    await fillForm(user, 'alice', 'alice123');
    expect(screen.getByRole('button', { name: 'Acceder al sistema' })).toBeEnabled();
  });

  it('should log in with the entered credentials and navigate to /posts on success', async () => {
    const { user, router } = await setup();
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    await fillForm(user, 'alice', 'alice123');

    await user.click(screen.getByRole('button', { name: 'Acceder al sistema' }));

    expect(authServiceMock.login).toHaveBeenCalledWith({
      username: 'alice',
      password: 'alice123',
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/posts']);
  });

  it('should not navigate when login fails', async () => {
    authServiceMock.login.mockRejectedValueOnce(new Error('Credenciales inválidas'));
    const { user, router } = await setup();
    const navigateSpy = vi.spyOn(router, 'navigate');
    await fillForm(user, 'alice', 'wrong-password');

    await user.click(screen.getByRole('button', { name: 'Acceder al sistema' }));

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should display the error message coming from AuthService', async () => {
    const { fixture } = await setup();
    authServiceMock.error.set('Credenciales inválidas');
    fixture.detectChanges();

    expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
  });

  it('should not display an error message when there is none', async () => {
    await setup();
    expect(screen.queryByText('Credenciales inválidas')).not.toBeInTheDocument();
  });

  it('should call clearError when the dismiss button is clicked', async () => {
    const { fixture, user } = await setup();
    authServiceMock.error.set('Credenciales inválidas');
    fixture.detectChanges();

    await user.click(screen.getByRole('button', { name: 'Cerrar mensaje de error' }));

    expect(authServiceMock.clearError).toHaveBeenCalled();
  });

  it('should disable the inputs and the submit button while logging in', async () => {
    const { fixture } = await setup();
    authServiceMock.loading.set(true);
    fixture.detectChanges();

    expect(screen.getByLabelText('Usuario')).toBeDisabled();
    expect(screen.getByLabelText('Contrasena')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Acceder al sistema' })).toBeDisabled();
  });
});
