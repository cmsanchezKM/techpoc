import { render, screen } from '@testing-library/angular';
import { signal } from '@angular/core';
import { provideTransloco, TranslocoLoader } from '@jsverse/transloco';
import { of } from 'rxjs';
import { PostComments } from './post-comments';
import { CommentsApi } from '../data-access/comments-api';
import { AuthService } from '@features/auth/data-access/auth.service';
import { User } from '@core/models/user.model';

class TranslocoLoaderMock implements TranslocoLoader {
  getTranslation() {
    return of({
      comments: {
        title: 'Comentarios',
        loading: 'Cargando...',
        error: 'Error',
        empty: 'Sin comentarios',
        label: 'Comentario',
        placeholder: 'Escribe...',
        submit: 'Enviar',
        loginToComment: 'Inicia sesión para comentar',
      },
    });
  }
}

const mockUser: User = {
  id: '1',
  name: 'alice',
  email: 'alice@example.com',
  avatar: 'a.jpg',
};

async function setup(currentUser: User | null = mockUser) {
  const commentsApiMock = {
    comments: signal([]),
    isLoading: signal(false),
    error: signal<unknown>(null),
    loadComments: vi.fn(),
    addComment: vi.fn(async () => ({
      id: '1',
      postId: '5',
      userId: '1',
      body: 'hola',
      createdAt: '2026-01-01',
    })),
  };
  const authServiceMock = {
    currentUser: signal(currentUser),
    isAuthenticated: signal(!!currentUser),
  };

  const result = await render(PostComments, {
    componentInputs: { postId: '5' },
    providers: [
      provideTransloco({
        config: { availableLangs: ['es', 'en'], defaultLang: 'es' },
        loader: TranslocoLoaderMock,
      }),
      { provide: CommentsApi, useValue: commentsApiMock },
      { provide: AuthService, useValue: authServiceMock },
    ],
  });

  return { ...result, commentsApiMock, authServiceMock };
}

describe('PostComments', () => {
  it('loads the comments of the post on init', async () => {
    const { commentsApiMock } = await setup();

    expect(commentsApiMock.loadComments).toHaveBeenCalledWith('5');
  });

  it('updates the draft body when typing', async () => {
    const { fixture } = await setup();

    fixture.componentInstance.onBodyChange({
      target: { value: 'Hola mundo' },
    } as unknown as Event);

    expect(fixture.componentInstance.newCommentBody()).toBe('Hola mundo');
  });

  it('submits a comment and clears the draft on success', async () => {
    const { fixture, commentsApiMock } = await setup();
    fixture.componentInstance.newCommentBody.set('Hola mundo');

    await fixture.componentInstance.onSubmit({ preventDefault: vi.fn() } as unknown as Event);

    expect(commentsApiMock.addComment).toHaveBeenCalledWith({
      postId: '5',
      userId: '1',
      body: 'Hola mundo',
    });
    expect(fixture.componentInstance.newCommentBody()).toBe('');
    expect(fixture.componentInstance.isSubmitting()).toBe(false);
  });

  it('does not submit when the body is empty', async () => {
    const { fixture, commentsApiMock } = await setup();
    fixture.componentInstance.newCommentBody.set('   ');

    await fixture.componentInstance.onSubmit({ preventDefault: vi.fn() } as unknown as Event);

    expect(commentsApiMock.addComment).not.toHaveBeenCalled();
  });

  it('does not submit when there is no authenticated user', async () => {
    const { fixture, commentsApiMock } = await setup(null);
    fixture.componentInstance.newCommentBody.set('Hola mundo');

    await fixture.componentInstance.onSubmit({ preventDefault: vi.fn() } as unknown as Event);

    expect(commentsApiMock.addComment).not.toHaveBeenCalled();
  });

  it('shows the login prompt instead of the form when not authenticated', async () => {
    await setup(null);

    expect(screen.getByText('Inicia sesión para comentar')).toBeInTheDocument();
    expect(screen.queryByLabelText('Comentario')).not.toBeInTheDocument();
  });
});
