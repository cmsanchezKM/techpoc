import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  convertToParamMap,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Observable } from 'rxjs';
import { ownerGuard } from './owner-guard';
import { AuthService } from '@features/auth/data-access/auth.service';
import { API_BASE } from 'environments/environment';

describe('ownerGuard', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    localStorage.clear();
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

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  function runGuard(id: string) {
    const route = { paramMap: convertToParamMap({ id }) } as unknown as ActivatedRouteSnapshot;
    return TestBed.runInInjectionContext(() =>
      ownerGuard(route, {} as RouterStateSnapshot),
    ) as Observable<unknown>;
  }

  it('allows access when the post belongs to the current user', async () => {
    TestBed.inject(AuthService);
    const result = runGuard('42');
    const valuePromise = new Promise((resolve) => result.subscribe(resolve));

    httpMock.expectOne(`${API_BASE}/posts/42`).flush({ id: '42', userId: 1 });

    await expect(valuePromise).resolves.toBe(true);
  });

  it('redirects when the post belongs to another user', async () => {
    TestBed.inject(AuthService);
    const result = runGuard('42');
    const valuePromise = new Promise((resolve) => result.subscribe(resolve));

    httpMock.expectOne(`${API_BASE}/posts/42`).flush({ id: '42', userId: 999 });

    const router = TestBed.inject(Router);
    const value = await valuePromise;
    expect((value as { toString(): string }).toString()).toBe(
      router.parseUrl('/posts/42').toString(),
    );
  });
});
