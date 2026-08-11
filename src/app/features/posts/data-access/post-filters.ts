import { inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PostFilters {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  searchTerm = signal<string>('');
  selectedTag = signal<string | null>(null);
  selectedAuthor = signal<string | null>(null);

  constructor() {
    this.initializeFromQueryParams();
    this.watchQueryParams();
  }

  private initializeFromQueryParams(): void {
    this.route.queryParams.pipe(take(1)).subscribe((params: Params) => {
      this.searchTerm.set(params['search'] || '');
      this.selectedTag.set(params['tag'] || null);
      this.selectedAuthor.set(params['author'] || null);
    });
  }

  private watchQueryParams(): void {
    this.route.queryParamMap.subscribe((params: ParamMap) => {
      this.searchTerm.set(params.get('search') || '');
      this.selectedTag.set(params.get('tag') || null);
      this.selectedAuthor.set(params.get('author') || null);
    });
  }

  // Métodos para actualizar - automáticamente actualizan la URL
  setSearchTerm(term: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: term || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  setSelectedTag(tag: string | null): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tag: tag || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  setSelectedAuthor(author: string | null): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { author: author || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  // Limpiar todos los filtros
  reset(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: null, tag: null, author: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
