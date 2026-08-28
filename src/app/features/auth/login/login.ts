import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormField, FormRoot, disabled, form, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { IconComponent } from '../../../shared/icons/icon.component';
import { AuthService } from '../data-access/auth.service';

interface LoginFormModel {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [FormField, FormRoot, IconComponent, TranslocoDirective],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private router = inject(Router);
  private authService = inject(AuthService);

  // Signals del servicio
  readonly loading = this.authService.loading;
  readonly error = this.authService.error;

  private readonly model = signal<LoginFormModel>({ username: '', password: '' });
  readonly loginForm = form(
    this.model,
    (path) => {
      required(path.username);
      required(path.password);
      disabled(path.username, () => this.loading());
      disabled(path.password, () => this.loading());
    },
    {
      submission: {
        action: async (field) => {
          const { username, password } = field().value();

          try {
            await this.authService.login({ username, password });
            // Login exitoso, navegar a posts
            this.router.navigate(['/posts']);
          } catch (error) {
            // El error ya está manejado en el servicio
            console.error('Error en login:', error);
          }
        },
      },
    },
  );

  clearError() {
    this.authService.clearError();
  }
}
