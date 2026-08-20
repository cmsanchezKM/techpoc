import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { authInterceptor } from './auth-interceptor';
import { AuthService } from '@features/auth/data-access/auth.service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('authInterceptor', () => {
  let authService: AuthService;
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    authService = TestBed.inject(AuthService);
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should add Authorization header when user is authenticated', () => {
    // Simular usuario autenticado estableciendo el token en localStorage
    localStorage.setItem('auth_token', 'mock-jwt-token-1234567890');

    // Recrear el servicio para que cargue del localStorage
    authService = TestBed.inject(AuthService);

    // Hacer una petición HTTP
    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-jwt-token-1234567890');
    req.flush({});
  });

  it('should not add Authorization header when user is not authenticated', () => {
    // Sin token - usuario no autenticado
    expect(authService.token()).toBeNull();

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should work with different HTTP methods', () => {
    localStorage.setItem('auth_token', 'mock-jwt-token-1234567890');
    authService = TestBed.inject(AuthService);

    // POST
    httpClient.post('/api/posts', { title: 'Test' }).subscribe();
    const postReq = httpMock.expectOne('/api/posts');
    expect(postReq.request.headers.get('Authorization')).toBe('Bearer mock-jwt-token-1234567890');
    postReq.flush({});

    // PUT
    httpClient.put('/api/posts/1', { title: 'Updated' }).subscribe();
    const putReq = httpMock.expectOne('/api/posts/1');
    expect(putReq.request.headers.get('Authorization')).toBe('Bearer mock-jwt-token-1234567890');
    putReq.flush({});

    // DELETE
    httpClient.delete('/api/posts/1').subscribe();
    const deleteReq = httpMock.expectOne('/api/posts/1');
    expect(deleteReq.request.headers.get('Authorization')).toBe('Bearer mock-jwt-token-1234567890');
    deleteReq.flush({});
  });
});
