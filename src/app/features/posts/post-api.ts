import { httpResource } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { Post } from '../../core/models/post.model';
import { User } from '../../core/models/user.model';

const API_BASE = 'http://localhost:3000';
const ITEMS_PER_PAGE = 6;

@Injectable({ providedIn: 'root' })
export class PostsApi {
  readonly searchTerm = signal('');
  readonly selectedAuthors = signal<number[]>([]);
  readonly selectedTags = signal<string[]>([]);
  readonly currentPage = signal(1);

  private readonly postsResource = httpResource<Post[]>(() => `${API_BASE}/posts`);
  private readonly usersResource = httpResource<User[]>(() => `${API_BASE}/users`);

  readonly allPosts = computed(() => this.postsResource.value() ?? []);
  readonly allUsers = computed(() => this.usersResource.value() ?? []);

  private readonly userMap = computed(() => {
    const map = new Map<number, string>();
    this.allUsers().forEach((u) => map.set(u.id, u.name));
    return map;
  });

  getUserName(id: number): string {
    return this.userMap().get(id) ?? `Autor ${id}`;
  }

  readonly filteredPosts = computed(() => {
    let posts = this.allPosts();
    const term = this.searchTerm().toLowerCase().trim();
    const authors = this.selectedAuthors();
    const tags = this.selectedTags();

    // Filtro por búsqueda
    if (term) {
      posts = posts.filter(
        (p) => p.title.toLowerCase().includes(term) || p.body.toLowerCase().includes(term),
      );
    }

    // Filtro por autores
    if (authors.length > 0) {
      posts = posts.filter((p) => authors.includes(p.userId));
    }

    // Filtro por tags
    if (tags.length > 0) {
      posts = posts.filter((p) => tags.some((t) => p.tags.includes(t)));
    }

    return posts;
  });

  readonly uniqueAuthors = computed(() => {
    const authorsSet = new Set(this.allPosts().map((p) => p.userId));
    return Array.from(authorsSet).sort();
  });

  readonly uniqueTags = computed(() => {
    const tagsSet = new Set<string>();
    this.allPosts().forEach((p) => p.tags.forEach((t) => tagsSet.add(t)));
    return Array.from(tagsSet).sort();
  });

  readonly totalPages = computed(() => Math.ceil(this.filteredPosts().length / ITEMS_PER_PAGE));

  readonly paginatedPosts = computed(() => {
    const filtered = this.filteredPosts();
    const page = Math.max(1, Math.min(this.currentPage(), this.totalPages() || 1));
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filtered.slice(start, end);
  });

  readonly isLoading = this.postsResource.isLoading;
  readonly error = this.postsResource.error;

  toggleAuthor(authorId: number): void {
    const authors = this.selectedAuthors();
    if (authors.includes(authorId)) {
      this.selectedAuthors.set(authors.filter((id) => id !== authorId));
    } else {
      this.selectedAuthors.set([...authors, authorId]);
    }
    this.currentPage.set(1);
  }

  toggleTag(tag: string): void {
    const tags = this.selectedTags();
    if (tags.includes(tag)) {
      this.selectedTags.set(tags.filter((t) => t !== tag));
    } else {
      this.selectedTags.set([...tags, tag]);
    }
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }
}
