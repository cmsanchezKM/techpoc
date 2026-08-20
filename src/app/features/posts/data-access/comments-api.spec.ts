import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { User } from '@core/models/user.model';
import { UsersApi } from '@features/users/data-access/users-api';
import { CommentsApi, CreateCommentPayload } from './comments-api';

describe('CommentsApi', () => {
  let service: CommentsApi;
  let httpMock: HttpTestingController;
  let usersApi: UsersApi;

  const mockUsers: User[] = [
    {
      id: '2',
      name: 'bruno',
      email: 'bruno@example.com',
      avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=bruno',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommentsApi, UsersApi, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CommentsApi);
    httpMock = TestBed.inject(HttpTestingController);
    usersApi = TestBed.inject(UsersApi);

    Object.defineProperty(usersApi, 'users', {
      get: () => signal(mockUsers),
      configurable: true,
    });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe convertir postId y userId a number antes de persistir', async () => {
    const payload = {
      postId: '10',
      userId: '2',
      body: 'Comentario de prueba',
    } as unknown as CreateCommentPayload;

    const addPromise = service.addComment(payload);

    const req = httpMock.expectOne('http://localhost:3000/comments');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.postId).toBe(10);
    expect(req.request.body.userId).toBe(2);

    req.flush({
      id: '999',
      postId: '10',
      userId: '2',
      body: 'Comentario de prueba',
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    await addPromise;
  });

  it('debe devolver el comentario con IDs numéricos aunque la API responda string', async () => {
    const payload = {
      postId: 7,
      userId: 2,
      body: 'Otro comentario',
    } satisfies CreateCommentPayload;

    const addPromise = service.addComment(payload);

    const req = httpMock.expectOne('http://localhost:3000/comments');
    req.flush({
      id: '321',
      postId: '7',
      userId: '2',
      body: 'Otro comentario',
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    const created = await addPromise;
    expect(created.id).toBe(321);
    expect(created.postId).toBe(7);
    expect(created.userId).toBe(2);
  });
});
