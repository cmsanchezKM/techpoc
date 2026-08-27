import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { PostsApi } from '@features/posts/data-access/posts-api';
import { AuthService } from '@features/auth/data-access/auth.service';
import { RelativeTimeDirective } from '@shared';
import { PostComments } from '../comments/post-comments';

@Component({
  selector: 'app-post-detail',
  imports: [CommonModule, TranslocoDirective, RelativeTimeDirective, PostComments],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostDetail {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  protected postsService = inject(PostsApi);
  protected authService = inject(AuthService);

  /** ID del post, vinculado desde el parámetro de ruta `:id`. */
  readonly id = input.required<string>();

  private readonly postId = computed(() => this.id());

  readonly post = computed(() => this.postsService.selectedPost());
  readonly isLoading = this.postsService.postLoading;
  readonly error = this.postsService.postError;

  readonly isOwner = computed(() => {
    const post = this.post();
    const user = this.authService.currentUser();
    return !!post && !!user && String(post.userId) === String(user.id);
  });

  constructor() {
    // Selecciona el post correspondiente cada vez que cambia el ID de la ruta.
    effect(() => {
      this.postsService.getPostById(this.postId());
    });
  }

  goToEdit(): void {
    this.router.navigate(['/posts', this.postId(), 'edit']);
  }

  async onDelete(): Promise<void> {
    const post = this.post();
    if (!post) {
      return;
    }
    if (isPlatformBrowser(this.platformId) && !confirm('¿Seguro que quieres borrar este post?')) {
      return;
    }
    await this.postsService.deletePost(post.id);
    this.router.navigate(['/posts']);
  }
}
