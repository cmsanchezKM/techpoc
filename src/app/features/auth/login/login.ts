import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { IconComponent } from '../../../shared/icons/icon.component';
import { AuthService } from '../data-access/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, IconComponent, TranslocoDirective],
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

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  async onSubmit() {
    if (this.loginForm.valid) {
      const username = this.loginForm.value.username!;
      const password = this.loginForm.value.password!;

      try {
        await this.authService.login({ username, password });
        // Login exitoso, navegar a posts
        this.router.navigate(['/posts']);
      } catch (error) {
        // El error ya está manejado en el servicio
        console.error('Error en login:', error);
      }
    }
  }

  clearError() {
    this.authService.clearError();
  }
}
