import { Injectable, computed, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { User } from '@core/models/user.model';
import { Credentials, LoginResponse } from './auth.model';
import { UsersApi } from '@features/users/data-access/users-api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const MOCK_TOKEN = 'mock-jwt-token-1234567890';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usersApi = inject(UsersApi);
  private readonly platformId = inject(PLATFORM_ID);

  // Signals para el estado de autenticación
  private readonly tokenSignal = signal<string | null>(this.loadTokenFromStorage());
  private readonly currentUserSignal = signal<User | null>(this.loadUserFromStorage());
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  // Signals públicos (solo lectura)
  readonly token = this.tokenSignal.asReadonly();
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  /**
   * Realiza el login del usuario validando contra la API de users
   * La validación busca un usuario donde name coincida con username
   * y el password sea igual al name (simulación simple)
   *
   */
  async login(credentials: Credentials): Promise<LoginResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      // Obtener usuarios directamente del Signal
      const users = await this.waitForUsers();

      // Buscar usuario que coincida con las credenciales
      const user = users.find(
        (u) =>
          u.name.toLowerCase() === credentials.username.toLowerCase() &&
          credentials.password === u.password, // Validación simple: password = name
      );

      if (!user) {
        throw new Error('Credenciales inválidas');
      }

      // Autenticación exitosa
      this.tokenSignal.set(MOCK_TOKEN);
      this.currentUserSignal.set(user);
      this.saveToStorage(MOCK_TOKEN, user);
      this.loadingSignal.set(false);

      return { token: MOCK_TOKEN };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
      this.errorSignal.set(message);
      this.loadingSignal.set(false);
      throw error;
    }
  }

  /**
   * Espera a que los usuarios estén cargados desde el httpResource
   * Patrón de retry simple para trabajar con Signals
   */
  private async waitForUsers(maxAttempts = 50, delay = 100): Promise<User[]> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const users = this.usersApi.users();

      if (users.length > 0) {
        return users;
      }

      // Esperar antes del siguiente intento
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    throw new Error('Tiempo de espera agotado al cargar el usuario');
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.errorSignal.set(null);
    this.clearStorage();
  }

  /**
   * Limpia el error actual
   */
  clearError(): void {
    this.errorSignal.set(null);
  }

  /**
   * Carga el token desde localStorage (solo en browser)
   */
  private loadTokenFromStorage(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  /**
   * Carga el usuario desde localStorage (solo en browser)
   */
  private loadUserFromStorage(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const userJson = localStorage.getItem(USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    }
    return null;
  }

  /**
   * Guarda el token y usuario en localStorage (solo en browser)
   */
  private saveToStorage(token: string, user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  /**
   * Limpia el localStorage (solo en browser)
   */
  private clearStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }
}
