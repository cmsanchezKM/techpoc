import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormField, FormRoot, disabled, form, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { IconComponent } from '@shared/icons/icon.component';
import { PostsApi } from '@features/posts/data-access/posts-api';
import { AuthService } from '@features/auth/data-access/auth.service';

interface PostFormModel {
  title: string;
  body: string;
  tags: string;
}

@Component({
  selector: 'app-post-form',
  imports: [FormField, FormRoot, IconComponent, TranslocoDirective],
  templateUrl: './post-form.html',
  styleUrl: './post-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostForm {
  private readonly router = inject(Router);
  private readonly postsService = inject(PostsApi);
  private readonly authService = inject(AuthService);

  /** ID del post a editar, vinculado desde el parámetro de ruta `:id`. Ausente al crear. */
  readonly id = input<string>();

  readonly isEditMode = computed(() => this.id() !== undefined);
  private readonly postId = computed(() => this.id());

  readonly post = computed(() => this.postsService.selectedPost());
  readonly loading = this.postsService.postLoading;
  readonly submitting = this.postsService.isLoading;
  readonly error = this.postsService.postError;
  readonly submitError = signal<string | null>(null);

  private readonly model = signal<PostFormModel>({ title: '', body: '', tags: '' });
  readonly postForm = form(
    this.model,
    (path) => {
      required(path.title);
      required(path.body);
      disabled(path.title, () => this.submitting());
      disabled(path.body, () => this.submitting());
      disabled(path.tags, () => this.submitting());
    },
    {
      submission: {
        action: async (field) => {
          this.submitError.set(null);
          const { title, body, tags } = field().value();
          const parsedTags = tags
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0);

          try {
            const id = this.postId();
            if (id !== undefined) {
              await this.postsService.updatePost(id, {
                title: title.trim(),
                body: body.trim(),
                tags: parsedTags,
              });
              this.router.navigate(['/posts', id]);
              return;
            }

            const userId = this.authService.currentUser()?.id ?? '';
            const created = await this.postsService.createPost({
              userId,
              title: title.trim(),
              body: body.trim(),
              tags: parsedTags,
            });
            this.router.navigate(['/posts', created.id]);
          } catch (error) {
            this.submitError.set(
              error instanceof Error ? error.message : 'Error al guardar el post',
            );
          }
        },
      },
    },
  );

  constructor() {
    // Carga el post a editar y precarga el formulario cuando cambia el ID de la ruta.
    effect(() => {
      const id = this.postId();
      if (id === undefined) {
        this.postsService.clearSelectedPost();
        return;
      }
      this.postsService.getPostById(id);
    });

    effect(() => {
      if (!this.isEditMode()) {
        return;
      }
      const post = this.post();
      if (!post) {
        return;
      }
      this.model.set({
        title: post.title,
        body: post.body,
        tags: post.tags.join(', '),
      });
    });
  }

  onCancel(): void {
    const id = this.postId();
    this.router.navigate(id !== undefined ? ['/posts', id] : ['/posts']);
  }
}
