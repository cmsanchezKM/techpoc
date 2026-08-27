import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { IconComponent } from '@shared/icons/icon.component';
import { PostsApi } from '@features/posts/data-access/posts-api';
import { AuthService } from '@features/auth/data-access/auth.service';

@Component({
  selector: 'app-post-form',
  imports: [ReactiveFormsModule, IconComponent, TranslocoDirective],
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

  form = new FormGroup({
    title: new FormControl('', [Validators.required]),
    body: new FormControl('', [Validators.required]),
    tags: new FormControl(''),
  });

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
      this.form.patchValue({
        title: post.title,
        body: post.body,
        tags: post.tags.join(', '),
      });
    });
  }

  async onSubmit(): Promise<void> {
    if (!this.form.valid) {
      return;
    }

    const title = this.form.value.title!.trim();
    const body = this.form.value.body!.trim();
    const tags = (this.form.value.tags ?? '')
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const id = this.postId();
    if (id !== undefined) {
      await this.postsService.updatePost(id, { title, body, tags });
      this.router.navigate(['/posts', id]);
      return;
    }

    const userId = this.authService.currentUser()?.id ?? '';
    const post = await this.postsService.createPost({ userId, title, body, tags });
    this.router.navigate(['/posts', post.id]);
  }

  onCancel(): void {
    const id = this.postId();
    this.router.navigate(id !== undefined ? ['/posts', id] : ['/posts']);
  }
}
