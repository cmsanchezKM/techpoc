import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { User } from '@core/models/user.model';
import { UsersApi } from '@features/users/data-access/users-api';
import { Post } from '@core/models/post.model';
import { PostsApi } from './posts-api';

describe('PostsApi', () => {
  let service: PostsApi;
  let httpMock: HttpTestingController;

  const mockUsers: User[] = [
    {
      id: '1',
      name: 'alice',
      email: 'alice@example.com',
      avatar: 'avatar1.jpg',
    },
  ];

  const mockPost: Post = {
    id: '1',
    userId: '1',
    title: 'Post 1',
    body: 'Body 1',
    tags: [],
    createdAt: '2026-01-01',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PostsApi,
        provideHttpClient(),
        provideHttpClientTesting(),
        // Se reemplaza UsersApi por un mock plano: su propio httpResource se
        // dispararía de verdad al hacer `TestBed.tick()` para resolver el de
        // PostsApi, dejando una petición GET /users sin responder.
        { provide: UsersApi, useValue: { users: signal(mockUsers) } },
      ],
    });

    service = TestBed.inject(PostsApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  /** Deja asentar el microtask con el que el resource resuelve internamente. */
  async function settle() {
    await Promise.resolve();
    TestBed.tick();
  }

  /**
   * `postsResource` no depende de ningún signal: se dispara solo, sin que
   * nadie lo pida, en cuanto se hace el primer `TestBed.tick()`. Todos los
   * tests deben responderlo una vez, aunque no les interese el listado.
   */
  async function flushInitialPosts(posts: Post[] = []) {
    TestBed.tick();
    httpMock.expectOne('http://localhost:3000/posts').flush(posts);
    await settle();
  }

  async function flushSelectedPost(id: string, post: Post) {
    service.getPostById(id);
    TestBed.tick();
    httpMock.expectOne(`http://localhost:3000/posts/${id}`).flush(post);
    await settle();
  }

  it('resuelve el autor de cada post a partir de UsersApi', async () => {
    await flushInitialPosts([mockPost]);

    expect(service.allPosts()[0].author?.name).toBe('alice');
  });

  it('selecciona un post por id y resuelve su autor', async () => {
    await flushInitialPosts();
    await flushSelectedPost('1', mockPost);

    expect(service.selectedPost()?.author?.name).toBe('alice');
  });

  it('no expone post seleccionado si el recurso no tiene valor', async () => {
    await flushInitialPosts();

    expect(service.selectedPost()).toBeUndefined();
  });

  it('limpia la selección del post actual', async () => {
    await flushInitialPosts();
    await flushSelectedPost('1', mockPost);

    service.clearSelectedPost();

    expect(service.selectedPost()).toBeUndefined();
  });

  it('crea un post, envía createdAt y recarga el listado', async () => {
    await flushInitialPosts();

    const createPromise = service.createPost({
      userId: '1',
      title: 'Nuevo',
      body: 'Contenido',
      tags: ['angular'],
    });

    const req = httpMock.expectOne('http://localhost:3000/posts');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.createdAt).toBeTruthy();
    req.flush({ ...mockPost, id: '99', title: 'Nuevo' });

    const created = await createPromise;
    expect(created.id).toBe('99');

    // El listado se recarga tras crear.
    TestBed.tick();
    httpMock.expectOne('http://localhost:3000/posts').flush([]);
  });

  it('actualiza un post y recarga el post seleccionado cuando coincide con el editado', async () => {
    await flushInitialPosts();
    await flushSelectedPost('5', { ...mockPost, id: '5' });

    const updatePromise = service.updatePost('5', { title: 'Editado' });

    const patchReq = httpMock.expectOne('http://localhost:3000/posts/5');
    expect(patchReq.request.method).toBe('PATCH');
    patchReq.flush({ ...mockPost, id: '5', title: 'Editado' });

    await updatePromise;
    TestBed.tick();

    // Se recarga el listado y, al coincidir el id, también el post seleccionado.
    httpMock.expectOne('http://localhost:3000/posts').flush([]);
    httpMock
      .expectOne('http://localhost:3000/posts/5')
      .flush({ ...mockPost, id: '5', title: 'Editado' });
  });

  it('actualiza un post sin recargar el seleccionado cuando no coincide', async () => {
    await flushInitialPosts();

    const updatePromise = service.updatePost('7', { title: 'Editado' });

    httpMock
      .expectOne('http://localhost:3000/posts/7')
      .flush({ ...mockPost, id: '7', title: 'Editado' });

    await updatePromise;
    TestBed.tick();

    httpMock.expectOne('http://localhost:3000/posts').flush([]);
    httpMock.expectNone('http://localhost:3000/posts/7');
  });

  it('borra un post, recarga el listado y limpia la selección si coincide', async () => {
    await flushInitialPosts();
    await flushSelectedPost('3', { ...mockPost, id: '3' });

    const deletePromise = service.deletePost('3');

    const deleteReq = httpMock.expectOne('http://localhost:3000/posts/3');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);

    await deletePromise;
    TestBed.tick();

    httpMock.expectOne('http://localhost:3000/posts').flush([]);
    expect(service.selectedPost()).toBeUndefined();
  });

  it('borra un post sin limpiar la selección cuando no coincide', async () => {
    await flushInitialPosts();
    await flushSelectedPost('3', { ...mockPost, id: '3' });

    const deletePromise = service.deletePost('4');
    httpMock.expectOne('http://localhost:3000/posts/4').flush(null);
    await deletePromise;
    TestBed.tick();

    httpMock.expectOne('http://localhost:3000/posts').flush([]);
    expect(service.selectedPost()?.id).toBe('3');
  });
});
