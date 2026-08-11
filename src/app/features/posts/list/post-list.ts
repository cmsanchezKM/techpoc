import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PostsApi } from '@features/posts/data-access/posts-api';
import { TranslocoDirective } from '@jsverse/transloco';
import { CardComponent, PaginationComponent } from '@shared';
import { CommonModule } from '@angular/common';
import { PostFilters } from '@features/posts/data-access/post-filters';

const ITEMS_PER_PAGE = 6;

@Component({
  selector: 'app-post-list',
  imports: [CommonModule, TranslocoDirective, CardComponent, PaginationComponent],
  templateUrl: './post-list.html',
  styleUrl: './post-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostList {
  private readonly router = inject(Router);
  protected postsService = inject(PostsApi);
  protected filterService = inject(PostFilters);

  /** Página actual, propia de esta vista (no compartida globalmente). */
  readonly currentPage = signal(1);

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filterService.setSearchTerm(value);
    this.currentPage.set(1);
  }

  filteredPosts = computed(() => {
    const posts = this.postsService.allPosts();
    const search = this.filterService.searchTerm().toLowerCase();
    const tag = this.filterService.selectedTag();
    const author = this.filterService.selectedAuthor();

    return posts.filter((post) => {
      const matchSearch =
        !search ||
        post.title.toLowerCase().includes(search) ||
        post.body.toLowerCase().includes(search);

      const matchTag = !tag || post.tags.includes(tag);
      const matchAuthor = !author || post.author?.id === author;

      return matchSearch && matchTag && matchAuthor;
    });
  });

  /** Número total de páginas según los posts filtrados. */
  readonly totalPages = computed(() => Math.ceil(this.filteredPosts().length / ITEMS_PER_PAGE));

  /** Subconjunto de posts filtrados correspondiente a la página actual. */
  readonly paginatedPosts = computed(() => {
    const posts = this.filteredPosts();
    const page = Math.max(1, Math.min(this.currentPage(), this.totalPages() || 1));
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return posts.slice(start, end);
  });

  onAuthorChange(value: string): void {
    this.filterService.setSelectedAuthor(value || null);
    this.currentPage.set(1);
  }

  onTagChange(value: string): void {
    this.filterService.setSelectedTag(value || null);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  goToViewDetail(id: number): void {
    this.router.navigate(['/posts', id]);
  }
}
