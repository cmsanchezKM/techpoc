import { render } from '@testing-library/angular';
import { signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { provideTransloco, TranslocoLoader } from '@jsverse/transloco';
import { of } from 'rxjs';
import { PostList } from './post-list';
import { PostsApi, PostWithAuthor } from '@features/posts/data-access/posts-api';
import { PostFilters } from '@features/posts/data-access/post-filters';
import { AuthService } from '@features/auth/data-access/auth.service';

class TranslocoLoaderMock implements TranslocoLoader {
  getTranslation() {
    return of({
      posts: {
        list: {
          title: 'Posts',
          newPost: 'Nuevo post',
          loading: 'Cargando...',
          error: 'Error',
          noResults: 'Sin resultados',
          showingResults: 'Mostrando',
          filters: { allAuthors: 'Todos los autores', allTags: 'Todas las etiquetas' },
        },
      },
      pagination: {
        previous: 'Previous',
        next: 'Next',
        pageNavigation: 'Page navigation',
        pageNumbers: 'Page numbers',
        goToPage: 'Go to page',
        previousPageLabel: 'Go to previous page',
        nextPageLabel: 'Go to next page',
      },
    });
  }
}

function makePost(overrides: Partial<PostWithAuthor>): PostWithAuthor {
  return {
    id: '1',
    userId: '1',
    title: 'Título',
    body: 'Cuerpo',
    tags: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const alice = { id: '1', name: 'alice', email: 'a@e.com', avatar: 'a.jpg' };
const bruno = { id: '2', name: 'bruno', email: 'b@e.com', avatar: 'b.jpg' };

const mockPosts: PostWithAuthor[] = [
  makePost({
    id: '1',
    title: 'Angular signals',
    body: 'Cuerpo 1',
    tags: ['angular', 'signals'],
    author: alice,
  }),
  makePost({ id: '2', title: 'RxJS basics', body: 'Cuerpo 2', tags: ['rxjs'], author: bruno }),
  makePost({
    id: '3',
    title: 'Otro post',
    body: 'Menciona angular en el cuerpo',
    tags: ['testing'],
    author: alice,
  }),
];

async function setup(
  options: {
    posts?: PostWithAuthor[];
    searchTerm?: string;
    selectedTag?: string | null;
    selectedAuthor?: string | null;
    isAuthenticated?: boolean;
  } = {},
) {
  const {
    posts = mockPosts,
    searchTerm = '',
    selectedTag = null,
    selectedAuthor = null,
    isAuthenticated = true,
  } = options;

  const postsApiMock = {
    allPosts: signal(posts),
    isLoading: signal(false),
    error: signal<unknown>(null),
  };
  const filterServiceMock = {
    searchTerm: signal(searchTerm),
    selectedTag: signal(selectedTag),
    selectedAuthor: signal(selectedAuthor),
    setSearchTerm: vi.fn(),
    setSelectedTag: vi.fn(),
    setSelectedAuthor: vi.fn(),
  };
  const authServiceMock = { isAuthenticated: signal(isAuthenticated) };

  const result = await render(PostList, {
    providers: [
      provideRouter([]),
      provideTransloco({
        config: { availableLangs: ['es', 'en'], defaultLang: 'es' },
        loader: TranslocoLoaderMock,
      }),
      { provide: PostsApi, useValue: postsApiMock },
      { provide: PostFilters, useValue: filterServiceMock },
      { provide: AuthService, useValue: authServiceMock },
    ],
  });

  const navigateSpy = vi.spyOn(result.fixture.debugElement.injector.get(Router), 'navigate');

  return { ...result, filterServiceMock, navigateSpy };
}

describe('PostList', () => {
  it('filters posts by search term in the title or body', async () => {
    const { fixture } = await setup({ searchTerm: 'angular' });

    expect(fixture.componentInstance.filteredPosts().map((p) => p.id)).toEqual(['1', '3']);
  });

  it('filters posts by selected tag', async () => {
    const { fixture } = await setup({ selectedTag: 'rxjs' });

    expect(fixture.componentInstance.filteredPosts().map((p) => p.id)).toEqual(['2']);
  });

  it('filters posts by selected author', async () => {
    const { fixture } = await setup({ selectedAuthor: '2' });

    expect(fixture.componentInstance.filteredPosts().map((p) => p.id)).toEqual(['2']);
  });

  it('combines search, tag and author filters', async () => {
    const { fixture } = await setup({
      searchTerm: 'angular',
      selectedTag: 'testing',
      selectedAuthor: '1',
    });

    expect(fixture.componentInstance.filteredPosts().map((p) => p.id)).toEqual(['3']);
  });

  it('lists unique authors sorted alphabetically', async () => {
    const { fixture } = await setup();

    expect(fixture.componentInstance.authorOptions()).toEqual([
      { value: '1', label: 'alice' },
      { value: '2', label: 'bruno' },
    ]);
  });

  it('lists unique tags sorted alphabetically', async () => {
    const { fixture } = await setup();

    expect(fixture.componentInstance.tagOptions().map((o) => o.value)).toEqual([
      'angular',
      'rxjs',
      'signals',
      'testing',
    ]);
  });

  it('paginates the filtered posts, 6 per page', async () => {
    const manyPosts = Array.from({ length: 8 }, (_, i) =>
      makePost({ id: String(i + 1), title: `Post ${i + 1}`, author: alice }),
    );
    const { fixture } = await setup({ posts: manyPosts });

    expect(fixture.componentInstance.totalPages()).toBe(2);
    expect(fixture.componentInstance.paginatedPosts()).toHaveLength(6);

    fixture.componentInstance.onPageChange(2);
    expect(fixture.componentInstance.paginatedPosts()).toHaveLength(2);
  });

  it('resets to page 1 when searching', async () => {
    const { fixture } = await setup();
    fixture.componentInstance.currentPage.set(3);

    fixture.componentInstance.onSearch({ target: { value: 'foo' } } as unknown as Event);

    expect(fixture.componentInstance.currentPage()).toBe(1);
  });

  it('resets to page 1 when changing the author filter', async () => {
    const { fixture, filterServiceMock } = await setup();
    fixture.componentInstance.currentPage.set(3);

    fixture.componentInstance.onAuthorChange('2');

    expect(filterServiceMock.setSelectedAuthor).toHaveBeenCalledWith('2');
    expect(fixture.componentInstance.currentPage()).toBe(1);
  });

  it('resets to page 1 when changing the tag filter', async () => {
    const { fixture, filterServiceMock } = await setup();
    fixture.componentInstance.currentPage.set(3);

    fixture.componentInstance.onTagChange('rxjs');

    expect(filterServiceMock.setSelectedTag).toHaveBeenCalledWith('rxjs');
    expect(fixture.componentInstance.currentPage()).toBe(1);
  });

  it('navigates to a post detail', async () => {
    const { fixture, navigateSpy } = await setup();

    fixture.componentInstance.goToViewDetail('2');

    expect(navigateSpy).toHaveBeenCalledWith(['/posts', '2']);
  });

  it('navigates to the new post form', async () => {
    const { fixture, navigateSpy } = await setup();

    fixture.componentInstance.goToNewPost();

    expect(navigateSpy).toHaveBeenCalledWith(['/posts', 'new']);
  });
});
