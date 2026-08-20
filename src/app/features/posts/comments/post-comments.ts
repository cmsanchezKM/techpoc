import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { AuthService } from '@features/auth/data-access/auth.service';
import { RelativeTimeDirective } from '@shared';
import { CommentsApi } from '../data-access/comments-api';

@Component({
  selector: 'app-post-comments',
  imports: [CommonModule, TranslocoDirective, RelativeTimeDirective],
  templateUrl: './post-comments.html',
  styleUrl: './post-comments.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostComments {
  protected commentsApi = inject(CommentsApi);
  protected authService = inject(AuthService);

  readonly postId = input.required<number>();

  readonly newCommentBody = signal('');
  readonly isSubmitting = signal(false);

  constructor() {
    // Recarga los comentarios cada vez que cambia el post mostrado.
    effect(() => {
      this.commentsApi.loadComments(this.postId());
    });
  }

  onBodyChange(event: Event): void {
    this.newCommentBody.set((event.target as HTMLTextAreaElement).value);
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const body = this.newCommentBody().trim();
    const user = this.authService.currentUser();
    if (!body || !user) {
      return;
    }

    this.isSubmitting.set(true);
    try {
      await this.commentsApi.addComment({ postId: this.postId(), userId: user.id, body });
      this.newCommentBody.set('');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
