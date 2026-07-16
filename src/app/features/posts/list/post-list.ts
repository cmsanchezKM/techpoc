import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PostsApi } from '../post-api';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-post-list',
  imports: [TranslocoDirective],
  templateUrl: './post-list.html',
  styleUrl: './post-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostList {
  protected readonly postsService = inject(PostsApi);
  private readonly router = inject(Router);

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.postsService.searchTerm.set(value);
  }

  viewDetail(id: number): void {
    this.router.navigate(['/posts', id]);
  }
}
