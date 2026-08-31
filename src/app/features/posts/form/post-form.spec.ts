import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { signal } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { provideTransloco, TranslocoLoader } from '@jsverse/transloco';
import { of } from 'rxjs';

import { PostForm } from './post-form';
import { PostsApi, PostWithAuthor } from '../data-access/posts-api';
import { AuthService } from '../../auth/data-access/auth.service';
import { User } from '../../../core/models/user.model';
import { Post } from '../../../core/models/post.model';

class TranslocoLoaderMock implements TranslocoLoader {
  getTranslation() {
    return of({
      posts: {
        form: {
          newTitle: 'Nuevo post',
          editTitle: 'Editar post',
          subtitle: 'Escribe tu post',
          loading: 'Cargando post...',
          error: 'Hubo un error al cargar el post.',
          submitError: 'Hubo un error al guardar el post.',
          titleLabel: 'Título',
          titlePlaceholder: 'Título del post...',
          bodyLabel: 'Contenido',
          bodyPlaceholder: 'Contenido del post...',
          tagsLabel: 'Tags',
          tagsPlaceholder: 'tags, separados por coma',
          cancel: 'Cancelar',
          publish: 'Publicar',
          save: 'Guardar',
        },
      },
    });
  }
}

const mockUser: User = {
  id: '1',
  name: 'alice',
  email: 'alice@example.com',
  avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=alice',
};

describe('PostForm', () => {
  let postsApiMock: {
    postLoading: ReturnType<typeof signal<boolean>>;
    isLoading: ReturnType<typeof signal<boolean>>;
    postError: ReturnType<typeof signal<unknown>>;
    selectedPost: ReturnType<typeof signal<PostWithAuthor | undefined>>;
    getPostById: ReturnType<typeof vi.fn>;
    clearSelectedPost: ReturnType<typeof vi.fn>;
    createPost: ReturnType<typeof vi.fn>;
    updatePost: ReturnType<typeof vi.fn>;
  };
  let authServiceMock: {
    currentUser: ReturnType<typeof signal<User | null>>;
  };

  const createdPost: Post = {
    id: '99',
    userId: '1',
    title: 'Mi post',
    body: 'Contenido del post',
    tags: ['angular', 'signals'],
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    postsApiMock = {
      postLoading: signal(false),
      isLoading: signal(false),
      postError: signal<unknown>(null),
      selectedPost: signal<PostWithAuthor | undefined>(undefined),
      getPostById: vi.fn(),
      clearSelectedPost: vi.fn(),
      createPost: vi.fn(async () => createdPost),
      updatePost: vi.fn(async () => createdPost),
    };
    authServiceMock = {
      currentUser: signal<User | null>(mockUser),
    };
  });

  async function setup(id?: string) {
    const user = userEvent.setup();
    const result = await render(PostForm, {
      componentInputs: id !== undefined ? { id } : {},
      providers: [
        provideRouter([]),
        provideTransloco({
          config: {
            availableLangs: ['es', 'en'],
            defaultLang: 'es',
          },
          loader: TranslocoLoaderMock,
        }),
        { provide: PostsApi, useValue: postsApiMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    });
    const router = result.fixture.debugElement.injector.get(Router);
    return { ...result, user, router };
  }

  async function fillForm(
    user: ReturnType<typeof userEvent.setup>,
    title: string,
    body: string,
    tags = '',
  ) {
    await user.type(screen.getByLabelText('Título'), title);
    await user.type(screen.getByLabelText('Contenido'), body);
    if (tags) {
      await user.type(screen.getByLabelText('Tags'), tags);
    }
  }

  it('should create', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should disable the submit button when the form is empty', async () => {
    await setup();
    expect(screen.getByRole('button', { name: 'Publicar' })).toBeDisabled();
  });

  it('should enable the submit button once title and body are filled', async () => {
    const { user } = await setup();
    await fillForm(user, 'Mi post', 'Contenido del post');
    expect(screen.getByRole('button', { name: 'Publicar' })).toBeEnabled();
  });

  it('should create a post with parsed tags and navigate to it on success', async () => {
    const { user, router } = await setup();
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    await fillForm(user, 'Mi post', 'Contenido del post', 'angular, signals');

    await user.click(screen.getByRole('button', { name: 'Publicar' }));

    expect(postsApiMock.createPost).toHaveBeenCalledWith({
      userId: '1',
      title: 'Mi post',
      body: 'Contenido del post',
      tags: ['angular', 'signals'],
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/posts', '99']);
  });

  it('should preload the form with the existing post in edit mode', async () => {
    postsApiMock.selectedPost.set({
      id: '5',
      userId: '1',
      title: 'Post existente',
      body: 'Cuerpo existente',
      tags: ['foo', 'bar'],
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    await setup('5');

    expect(screen.getByLabelText('Título')).toHaveValue('Post existente');
    expect(screen.getByLabelText('Contenido')).toHaveValue('Cuerpo existente');
    expect(screen.getByLabelText('Tags')).toHaveValue('foo, bar');
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
    expect(postsApiMock.getPostById).toHaveBeenCalledWith('5');
  });

  it('should update the post and navigate to it on success in edit mode', async () => {
    postsApiMock.selectedPost.set({
      id: '5',
      userId: '1',
      title: 'Post existente',
      body: 'Cuerpo existente',
      tags: ['foo'],
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    const { user, router } = await setup('5');
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await user.clear(screen.getByLabelText('Título'));
    await user.type(screen.getByLabelText('Título'), 'Post editado');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(postsApiMock.updatePost).toHaveBeenCalledWith('5', {
      title: 'Post editado',
      body: 'Cuerpo existente',
      tags: ['foo'],
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/posts', '5']);
  });

  it('should show an error message and not navigate when createPost fails', async () => {
    postsApiMock.createPost.mockRejectedValueOnce(new Error('Fallo al crear el post'));
    const { user, router } = await setup();
    const navigateSpy = vi.spyOn(router, 'navigate');
    await fillForm(user, 'Mi post', 'Contenido del post');

    await user.click(screen.getByRole('button', { name: 'Publicar' }));

    expect(screen.getByText('Hubo un error al guardar el post.')).toBeInTheDocument();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should dismiss the submit error message when the close button is clicked', async () => {
    postsApiMock.createPost.mockRejectedValueOnce(new Error('Fallo al crear el post'));
    const { user } = await setup();
    await fillForm(user, 'Mi post', 'Contenido del post');
    await user.click(screen.getByRole('button', { name: 'Publicar' }));
    expect(screen.getByText('Hubo un error al guardar el post.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cerrar mensaje de error' }));

    expect(screen.queryByText('Hubo un error al guardar el post.')).not.toBeInTheDocument();
  });

  it('should navigate back to the posts list on cancel when creating', async () => {
    const { user, router } = await setup();
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(navigateSpy).toHaveBeenCalledWith(['/posts']);
  });

  it('should navigate back to the post detail on cancel when editing', async () => {
    postsApiMock.selectedPost.set({
      id: '5',
      userId: '1',
      title: 'Post existente',
      body: 'Cuerpo existente',
      tags: [],
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    const { user, router } = await setup('5');
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(navigateSpy).toHaveBeenCalledWith(['/posts', '5']);
  });
});
