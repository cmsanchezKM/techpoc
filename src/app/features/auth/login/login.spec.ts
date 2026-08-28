import { ComponentFixture, TestBed } from '@angular/core/testing';
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
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let router: Router;
  let authServiceMock: {
    loading: ReturnType<typeof signal<boolean>>;
    error: ReturnType<typeof signal<string | null>>;
    login: ReturnType<typeof vi.fn>;
    clearError: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authServiceMock = {
      loading: signal(false),
      error: signal<string | null>(null),
      login: vi.fn(async () => ({ token: 'mock-jwt-token-1234567890' })),
      clearError: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Login],
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
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  function getUsernameInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector('#username');
  }

  function getPasswordInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector('#password');
  }

  function getSubmitButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button[type="submit"]');
  }

  async function fillForm(username: string, password: string): Promise<void> {
    const usernameInput = getUsernameInput();
    usernameInput.value = username;
    usernameInput.dispatchEvent(new Event('input'));

    const passwordInput = getPasswordInput();
    passwordInput.value = password;
    passwordInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable the submit button when the form is empty', () => {
    fixture.detectChanges();

    expect(getSubmitButton().disabled).toBe(true);
  });

  it('should enable the submit button once both fields are filled', async () => {
    fixture.detectChanges();

    await fillForm('alice', 'alice123');

    expect(getSubmitButton().disabled).toBe(false);
  });

  it('should log in with the entered credentials and navigate to /posts on success', async () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
    await fillForm('alice', 'alice123');

    getSubmitButton().click();
    await fixture.whenStable();

    expect(authServiceMock.login).toHaveBeenCalledWith({
      username: 'alice',
      password: 'alice123',
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/posts']);
  });

  it('should not navigate when login fails', async () => {
    authServiceMock.login.mockRejectedValueOnce(new Error('Credenciales inválidas'));
    const navigateSpy = vi.spyOn(router, 'navigate');
    fixture.detectChanges();
    await fillForm('alice', 'wrong-password');

    getSubmitButton().click();
    await fixture.whenStable();

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should display the error message coming from AuthService', () => {
    authServiceMock.error.set('Credenciales inválidas');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Credenciales inválidas');
  });

  it('should not display an error message when there is none', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.bg-red-50')).toBeNull();
  });

  it('should call clearError when the dismiss button is clicked', () => {
    authServiceMock.error.set('Credenciales inválidas');
    fixture.detectChanges();

    const dismissButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[aria-label="Cerrar mensaje de error"]',
    );
    dismissButton.click();

    expect(authServiceMock.clearError).toHaveBeenCalled();
  });

  it('should disable the inputs and the submit button while logging in', () => {
    authServiceMock.loading.set(true);
    fixture.detectChanges();

    expect(getUsernameInput().disabled).toBe(true);
    expect(getPasswordInput().disabled).toBe(true);
    expect(getSubmitButton().disabled).toBe(true);
  });
});
