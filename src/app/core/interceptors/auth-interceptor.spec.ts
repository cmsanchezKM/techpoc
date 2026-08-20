import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { authInterceptor } from './auth-interceptor';
import { AuthService } from '@features/auth/data-access/auth.service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  const tokenSignal = signal<string | null>(null);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            token: () => tokenSignal(),
          },
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    tokenSignal.set(null);
  });

  afterEach(() => {
    httpMock.verify();
    tokenSignal.set(null);
  });

  it('should add Authorization header when user is authenticated', () => {
    tokenSignal.set('mock-jwt-token-1234567890');

    // Hacer una petición HTTP
    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-jwt-token-1234567890');
    req.flush({});
  });

  it('should not add Authorization header when user is not authenticated', () => {
    // Sin token - usuario no autenticado
    expect(tokenSignal()).toBeNull();

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should work with different HTTP methods', () => {
    tokenSignal.set('mock-jwt-token-1234567890');

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
