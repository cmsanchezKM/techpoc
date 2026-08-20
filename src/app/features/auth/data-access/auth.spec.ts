import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { UsersApi } from '@features/users/data-access/users-api';
import { User } from '@core/models/user.model';
import { signal } from '@angular/core';

describe('AuthService', () => {
  let service: AuthService;
  let usersApi: UsersApi;

  const mockUsers: User[] = [
    {
      id: '1',
      name: 'John Doe',
      password: 'John Doe',
      email: 'john@example.com',
      avatar: 'avatar1.jpg',
    },
    {
      id: '2',
      name: 'Jane Smith',
      password: 'Jane Smith',
      email: 'jane@example.com',
      avatar: 'avatar2.jpg',
    },
  ];

  beforeEach(() => {
    // Limpiar localStorage antes de inyectar el servicio
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [AuthService, UsersApi, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    usersApi = TestBed.inject(UsersApi);

    // Mock del signal de usuarios
    Object.defineProperty(usersApi, 'users', {
      get: () => signal(mockUsers),
      configurable: true,
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with no authentication', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.token()).toBeNull();
    expect(service.currentUser()).toBeNull();
  });

  it('should login successfully with valid credentials', async () => {
    const credentials = { username: 'John Doe', password: 'John Doe' };

    const result = await service.login(credentials);

    expect(result.token).toBe('mock-jwt-token-1234567890');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.token()).toBe('mock-jwt-token-1234567890');
    expect(service.currentUser()?.name).toBe('John Doe');
  });

  it('should reject login with invalid username', async () => {
    const credentials = { username: 'Invalid User', password: 'Invalid User' };

    await expect(service.login(credentials)).rejects.toThrow('Credenciales inválidas');
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should reject login with incorrect password', async () => {
    const credentials = { username: 'John Doe', password: 'WrongPassword' };

    await expect(service.login(credentials)).rejects.toThrow('Credenciales inválidas');
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should logout and clear authentication state', async () => {
    const credentials = { username: 'John Doe', password: 'John Doe' };

    await service.login(credentials);
    expect(service.isAuthenticated()).toBe(true);

    // Logout
    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.token()).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });

  it('should set loading state during login', () => {
    expect(service.loading()).toBe(false);

    const credentials = { username: 'John Doe', password: 'John Doe' };
    const loginPromise = service.login(credentials);

    expect(service.loading()).toBe(true);

    return loginPromise;
  });

  it('should clear error message', async () => {
    const credentials = { username: 'Invalid', password: 'Invalid' };

    try {
      await service.login(credentials);
    } catch {
      expect(service.error()).toBeTruthy();

      service.clearError();

      expect(service.error()).toBeNull();
    }
  });

  it('should be case insensitive for username', async () => {
    const credentials = { username: 'john doe', password: 'John Doe' };

    const result = await service.login(credentials);

    expect(result.token).toBe('mock-jwt-token-1234567890');
    expect(service.currentUser()?.name).toBe('John Doe');
  });
});
