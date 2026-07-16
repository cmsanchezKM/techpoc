import { Injectable, computed, inject, signal, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Credentials, LoginResponse } from './auth.model';

const TOKEN_KEY = 'techpoc.token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private readonly _token = signal<string | null>(null);
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());

  // Cargar token al iniciar (llamar desde app.config.ts)
  // Esta aplicación es sencilla no hará falta un refresh token, pero en una app real se debería implementar.
  loadToken() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(TOKEN_KEY);
      this._token.set(token);
    }
  }

  login(credentials: Credentials) {
    return this.http.post<LoginResponse>('/api/auth/login', credentials);
  }

  setToken(token: string) {
    this._token.set(token);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  logout() {
    this._token.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
    }
  }
}
