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
import { postExistsGuard } from './post-exists-guard';
import { API_BASE } from 'environments/environment';

describe('postExistsGuard', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function runGuard(id: string) {
    const route = { paramMap: convertToParamMap({ id }) } as unknown as ActivatedRouteSnapshot;
    return TestBed.runInInjectionContext(() =>
      postExistsGuard(route, {} as RouterStateSnapshot),
    ) as Observable<unknown>;
  }

  it('allows access when the post exists', async () => {
    const result = runGuard('42');
    const valuePromise = new Promise((resolve) => result.subscribe(resolve));

    httpMock.expectOne(`${API_BASE}/posts/42`).flush({ id: '42', userId: 1 });

    await expect(valuePromise).resolves.toBe(true);
  });

  it('redirects to /not-found when the post does not exist', async () => {
    const result = runGuard('999');
    const valuePromise = new Promise((resolve) => result.subscribe(resolve));

    httpMock
      .expectOne(`${API_BASE}/posts/999`)
      .flush('Not found', { status: 404, statusText: 'Not Found' });

    const router = TestBed.inject(Router);
    const value = await valuePromise;
    expect((value as { toString(): string }).toString()).toBe(
      router.parseUrl('/not-found').toString(),
    );
  });
});
