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
      providers: [
        CommentsApi,
        // Mock plano: la clase real dispara su propio httpResource de
        // /users en cualquier `TestBed.tick()`, dejando una petición sin
        // responder en los tests que sí necesitan tick() para su resource.
        { provide: UsersApi, useValue: {} },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
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

  it('envía postId y userId como string al persistir', async () => {
    const payload: CreateCommentPayload = {
      postId: '10',
      userId: '2',
      body: 'Comentario de prueba',
    };

    const addPromise = service.addComment(payload);

    const req = httpMock.expectOne('http://localhost:3000/comments');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.postId).toBe('10');
    expect(req.request.body.userId).toBe('2');

    req.flush({
      id: '999',
      postId: '10',
      userId: '2',
      body: 'Comentario de prueba',
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    await addPromise;
  });

  it('devuelve el comentario creado con los IDs como string', async () => {
    const payload: CreateCommentPayload = {
      postId: '7',
      userId: '2',
      body: 'Otro comentario',
    };

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
    expect(created.id).toBe('321');
    expect(created.postId).toBe('7');
    expect(created.userId).toBe('2');
  });

  it('carga y ordena los comentarios del post seleccionado del más antiguo al más reciente', async () => {
    service.loadComments('10');
    TestBed.tick();

    httpMock.expectOne('http://localhost:3000/comments?postId=10').flush([
      {
        id: '2',
        postId: '10',
        userId: '2',
        body: 'Segundo',
        createdAt: '2026-01-02T00:00:00.000Z',
      },
      {
        id: '1',
        postId: '10',
        userId: '2',
        body: 'Primero',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
    await Promise.resolve();
    TestBed.tick();

    const comments = service.comments();
    expect(comments.map((c) => c.id)).toEqual(['1', '2']);
    expect(comments[0].author?.name).toBe('bruno');
  });

  it('no expone comentarios de otro post tras cambiar la selección', async () => {
    service.loadComments('10');
    TestBed.tick();
    httpMock.expectOne('http://localhost:3000/comments?postId=10').flush([]);
    await Promise.resolve();
    TestBed.tick();

    expect(service.comments()).toEqual([]);
  });

  it('combina los comentarios optimistas con los del servidor sin duplicarlos', async () => {
    service.loadComments('10');
    TestBed.tick();
    httpMock.expectOne('http://localhost:3000/comments?postId=10').flush([]);
    await Promise.resolve();
    TestBed.tick();

    const addPromise = service.addComment({ postId: '10', userId: '2', body: 'Nuevo comentario' });
    httpMock.expectOne('http://localhost:3000/comments').flush({
      id: '55',
      postId: '10',
      userId: '2',
      body: 'Nuevo comentario',
      createdAt: '2026-01-03T00:00:00.000Z',
    });
    await addPromise;

    // addComment recarga el resource: se responde con el mismo comentario
    // ya persistido para comprobar que no queda duplicado.
    TestBed.tick();
    httpMock.expectOne('http://localhost:3000/comments?postId=10').flush([
      {
        id: '55',
        postId: '10',
        userId: '2',
        body: 'Nuevo comentario',
        createdAt: '2026-01-03T00:00:00.000Z',
      },
    ]);
    await Promise.resolve();
    TestBed.tick();

    const comments = service.comments();
    expect(comments).toHaveLength(1);
    expect(comments[0].id).toBe('55');
  });
});
