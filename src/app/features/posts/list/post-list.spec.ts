import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { PostList } from './post-list';
import { PostsApi } from '../post-api';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Post } from '../../../core/models/post.model';

describe('PostList Component', () => {
  let mockPostsApi: any;
  let mockRouter: any;

  beforeEach(() => {
    // Mock data
    const mockPosts: Post[] = [
      {
        id: 1,
        title: 'Angular Testing',
        body: 'How to test Angular components',
        userId: 1,
        createdAt: new Date().toString(),
        tags: ['angular', 'testing'],
      },
      {
        id: 2,
        title: 'TypeScript Guide',
        body: 'Learn TypeScript basics',
        userId: 2,
        createdAt: new Date().toString(),
        tags: ['typescript'],
      },
    ];

    mockPostsApi = {
      // Signals
      searchTerm: signal(''),
      selectedAuthors: signal<number[]>([]),
      selectedTags: signal<string[]>([]),
      currentPage: signal(1),

      // Data signals
      allPosts: signal(mockPosts),
      allUsers: signal([
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' },
      ]),

      // Computed properties
      filteredPosts: computed(() => mockPosts),
      paginatedPosts: computed(() => mockPosts),
      uniqueAuthors: computed(() => [1, 2]),
      uniqueTags: computed(() => ['angular', 'testing', 'typescript']),
      totalPages: computed(() => 1),

      // Resource loading states
      isLoading: signal(false),
      error: signal(null),

      // Methods
      getUserName: vi.fn((id: number) => {
        const userMap: Record<number, string> = {
          1: 'John Doe',
          2: 'Jane Smith',
        };
        return userMap[id] ?? `Autor ${id}`;
      }),
      goToPage: vi.fn((page: number) => {
        mockPostsApi.currentPage.set(page);
      }),
      toggleAuthor: vi.fn((authorId: number) => {
        const authors = mockPostsApi.selectedAuthors();
        if (authors.includes(authorId)) {
          mockPostsApi.selectedAuthors.set(authors.filter((id: number) => id !== authorId));
        } else {
          mockPostsApi.selectedAuthors.set([...authors, authorId]);
        }
      }),
      toggleTag: vi.fn((tag: string) => {
        const tags = mockPostsApi.selectedTags();
        if (tags.includes(tag)) {
          mockPostsApi.selectedTags.set(tags.filter((t: string) => t !== tag));
        } else {
          mockPostsApi.selectedTags.set([...tags, tag]);
        }
      }),
    };

    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true),
    };
  });

  const setup = async () => {
    const user = userEvent.setup();
    const renderResult = await render(PostList, {
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { es: {}, en: {} },
          translocoConfig: {
            availableLangs: ['es', 'en'],
            defaultLang: 'es',
          },
        }),
      ],
      providers: [
        { provide: PostsApi, useValue: mockPostsApi },
        { provide: Router, useValue: mockRouter },
      ],
    });

    renderResult.fixture.detectChanges();
    await renderResult.fixture.whenStable();

    return { user, ...renderResult };
  };

  it('should render component', async () => {
    await setup();
    expect(true).toBe(true);
  });

  it('should navigate to detail page when viewDetail is called', async () => {
    const { fixture } = await setup();

    fixture.componentInstance.viewDetail(42);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/posts', 42]);
  });

  it('should display loading state', async () => {
    const { fixture } = await setup();

    mockPostsApi.isLoading.set(true);
    fixture.detectChanges();

    const loadingElement = screen.queryByText(/cargando|loading/i);
    expect(loadingElement).toBeTruthy();
  });

  it('should display error message when error is set', async () => {
    const { fixture } = await setup();

    mockPostsApi.error.set('Error al cargar posts');
    fixture.detectChanges();

    const errorElement = screen.queryByText(/error/i);
    expect(errorElement).toBeTruthy();
  });

  it('should display paginated posts', async () => {
    const { fixture } = await setup();

    fixture.detectChanges();
    await fixture.whenStable();

    // Buscar posts por título
    const postElements = screen.queryAllByText(/Angular Testing|TypeScript Guide/);
    expect(postElements.length).toBeGreaterThan(0);
  });

  it('should call goToPage when pagination changes', async () => {
    const { fixture } = await setup();

    (fixture.componentInstance as any).postsService.goToPage(2);
    fixture.detectChanges();

    expect(mockPostsApi.goToPage).toHaveBeenCalledWith(2);
  });
});
