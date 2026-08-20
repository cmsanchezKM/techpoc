import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth-guard';
import { AuthService } from '@features/auth/data-access/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('authGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should allow access when user is authenticated', () => {
    // Simular usuario autenticado estableciendo el token directamente
    localStorage.setItem('auth_token', 'mock-jwt-token-1234567890');
    localStorage.setItem(
      'auth_user',
      JSON.stringify({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        avatar: 'avatar.jpg',
      }),
    );

    // Recrear el servicio para que cargue del localStorage
    const authService = TestBed.inject(AuthService);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

    expect(result).toBe(true);
    expect(authService.isAuthenticated()).toBe(true);
  });

  it('should redirect to login when user is not authenticated', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

    expect(result).not.toBe(true);
    const router = TestBed.inject(Router);
    const urlTree = router.parseUrl('/login');
    expect(result.toString()).toBe(urlTree.toString());
  });
});
