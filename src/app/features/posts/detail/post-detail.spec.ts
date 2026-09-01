import { render } from '@testing-library/angular';
import { signal, PLATFORM_ID } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { provideTransloco, TranslocoLoader } from '@jsverse/transloco';
import { of } from 'rxjs';
import { PostDetail } from './post-detail';
import { PostsApi, PostWithAuthor } from '../data-access/posts-api';
import { AuthService } from '@features/auth/data-access/auth.service';
import { User } from '@core/models/user.model';

class TranslocoLoaderMock implements TranslocoLoader {
  getTranslation() {
    return of({
      posts: {
        detail: {
          loading: 'Cargando...',
          error: 'Error',
          notFound: 'No encontrado',
          edit: 'Editar',
          delete: 'Borrar',
        },
      },
    });
  }
}

const mockUser: User = { id: '1', name: 'alice', email: 'alice@example.com', avatar: 'a.jpg' };

const mockPost: PostWithAuthor = {
  id: '5',
  userId: '1',
  title: 'Mi post',
  body: 'Contenido',
  tags: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  author: mockUser,
};

async function setup(
  options: {
    post?: PostWithAuthor;
    currentUser?: User | null;
    platform?: 'browser' | 'server';
  } = {},
) {
  const { post = mockPost, currentUser = mockUser, platform = 'browser' } = options;

  const postsApiMock = {
    selectedPost: signal(post),
    postLoading: signal(false),
    postError: signal<unknown>(null),
    getPostById: vi.fn(),
    deletePost: vi.fn(async () => undefined),
  };
  const authServiceMock = { currentUser: signal(currentUser) };

  const result = await render(PostDetail, {
    componentInputs: { id: post?.id ?? '5' },
    providers: [
      provideRouter([]),
      provideTransloco({
        config: { availableLangs: ['es', 'en'], defaultLang: 'es' },
        loader: TranslocoLoaderMock,
      }),
      { provide: PostsApi, useValue: postsApiMock },
      { provide: AuthService, useValue: authServiceMock },
      { provide: PLATFORM_ID, useValue: platform },
    ],
  });

  const navigateSpy = vi.spyOn(result.fixture.debugElement.injector.get(Router), 'navigate');

  return { ...result, postsApiMock, navigateSpy };
}

describe('PostDetail', () => {
  it('selects the post matching the route id on init', async () => {
    const { postsApiMock } = await setup();

    expect(postsApiMock.getPostById).toHaveBeenCalledWith('5');
  });

  it('considers the current user the owner when ids match', async () => {
    const { fixture } = await setup();

    expect(fixture.componentInstance.isOwner()).toBe(true);
  });

  it('does not consider another user the owner', async () => {
    const { fixture } = await setup({
      currentUser: { id: '2', name: 'bruno', email: 'b@e.com', avatar: 'b.jpg' },
    });

    expect(fixture.componentInstance.isOwner()).toBe(false);
  });

  it('is not owned by anyone when there is no authenticated user', async () => {
    const { fixture } = await setup({ currentUser: null });

    expect(fixture.componentInstance.isOwner()).toBe(false);
  });

  it('navigates to the edit route', async () => {
    const { fixture, navigateSpy } = await setup();

    fixture.componentInstance.goToEdit();

    expect(navigateSpy).toHaveBeenCalledWith(['/posts', '5', 'edit']);
  });

  it('does nothing on delete when there is no post loaded', async () => {
    const { fixture, postsApiMock } = await setup({ post: undefined });

    await fixture.componentInstance.onDelete();

    expect(postsApiMock.deletePost).not.toHaveBeenCalled();
  });

  it('does not delete when the browser confirm dialog is dismissed', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { fixture, postsApiMock } = await setup();

    await fixture.componentInstance.onDelete();

    expect(confirmSpy).toHaveBeenCalled();
    expect(postsApiMock.deletePost).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('deletes the post and navigates to the list when confirmed', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { fixture, postsApiMock, navigateSpy } = await setup();

    await fixture.componentInstance.onDelete();

    expect(postsApiMock.deletePost).toHaveBeenCalledWith('5');
    expect(navigateSpy).toHaveBeenCalledWith(['/posts']);
    confirmSpy.mockRestore();
  });

  it('deletes without prompting confirm() when rendered on the server', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    const { fixture, postsApiMock } = await setup({ platform: 'server' });

    await fixture.componentInstance.onDelete();

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(postsApiMock.deletePost).toHaveBeenCalledWith('5');
    confirmSpy.mockRestore();
  });
});
