import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { Credentials } from './auth.model';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should initialize with null token and unauthenticated state', () => {
    expect(service.token()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should send POST request on login', () => {
    const mockCredentials: Credentials = { username: 'testuser', password: 'password123' };
    const mockResponse = { token: 'jwt-mock-token' };

    service.login(mockCredentials).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCredentials);
    req.flush(mockResponse);
  });

  it('should update signal and localStorage when setToken is called', () => {
    const token = 'my-fake-jwt';
    service.setToken(token);

    expect(service.token()).toBe(token);
    expect(service.isAuthenticated()).toBe(true);
    expect(localStorage.getItem('techpoc.token')).toBe(token);
  });

  it('should clear authentication state on logout', () => {
    service.setToken('my-fake-jwt');
    service.logout();

    expect(service.token()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('techpoc.token')).toBeNull();
  });

  it('should load stored token into signal when loadToken is called', () => {
    localStorage.setItem('techpoc.token', 'saved-token');
    service.loadToken();

    expect(service.token()).toBe('saved-token');
    expect(service.isAuthenticated()).toBe(true);
  });
});
