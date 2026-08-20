import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
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

  beforeEach(async () => {
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
          useValue: {
            loading: signal(false),
            error: signal<string | null>(null),
            login: async () => ({ token: 'mock-jwt-token-1234567890' }),
            clearError: () => undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
