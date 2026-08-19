import { Injectable, computed, inject, signal, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Credentials, LoginResponse } from './auth.model';

const TOKEN_KEY = 'techpoc.token';
const USER_ID_KEY = 'techpoc.userId';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private readonly _token = signal<string | null>(null);
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());

  // ID del usuario logueado, usado para comprobar la propiedad de posts/comentarios.
  // TODO: rellenar automáticamente al implementar el login real (decodificando el token o desde la respuesta del backend).
  private readonly _currentUserId = signal<string | null>(null);
  readonly currentUserId = this._currentUserId.asReadonly();

  // Cargar token al iniciar (llamar desde app.config.ts)
  // Esta aplicación es sencilla no hará falta un refresh token, pero en una app real se debería implementar.
  loadToken() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(TOKEN_KEY);
      this._token.set(token);
      this._currentUserId.set(localStorage.getItem(USER_ID_KEY));
    }
  }

  login(credentials: Credentials) {
    return this.http.post<LoginResponse>('/api/auth/login', credentials);
  }

  setToken(token: string, userId?: string) {
    this._token.set(token);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    if (userId) {
      this._currentUserId.set(userId);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(USER_ID_KEY, userId);
      }
    }
  }

  logout() {
    this._token.set(null);
    this._currentUserId.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_ID_KEY);
    }
  }
}
