import { HttpClient, httpResource } from '@angular/common/http';
import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { User } from '../../../core/models/user.model';
import { Post } from '../../../core/models/post.model';
import { UsersApi } from '../../users/data-access/users-api';
import { API_BASE } from 'environments/environment';

/** Post enriquecido con el objeto de usuario del autor. */
export interface PostWithAuthor extends Post {
  author?: User;
}

/** Datos necesarios para crear un post nuevo. */
export type CreatePostPayload = Omit<Post, 'id' | 'createdAt'>;

/** Datos admitidos al editar un post existente. */
export type UpdatePostPayload = Partial<Omit<Post, 'id'>>;

@Injectable({ providedIn: 'root' })
export class PostsApi {
  private http = inject(HttpClient);
  private usersApi = inject(UsersApi);

  private apiUrl = `${API_BASE}/posts`;

  private readonly selectedPostId = signal<string | undefined>(undefined);

  private readonly postsResource = httpResource<Post[]>(() => this.apiUrl);
  private readonly postByIdResource = httpResource<Post>(() => {
    const id = this.selectedPostId();
    return id ? `${this.apiUrl}/${id}` : undefined;
  });

  // Mapa de usuarios por ID para resolver el autor de cada post
  private readonly userMap = computed(() => {
    const map = new Map<string, User>();
    for (const user of this.usersApi.users()) {
      map.set(String(user.id), user);
    }
    return map;
  });

  /** Todos los posts, con el autor resuelto a partir de `UsersApi`. */
  readonly allPosts: Signal<PostWithAuthor[]> = computed(() => {
    const posts = this.postsResource.value() ?? [];
    const users = this.userMap();
    return posts.map((post) => ({ ...post, author: users.get(String(post.userId)) }));
  });

  /** Post seleccionado, con el autor resuelto a partir de `UsersApi`. */
  readonly selectedPost: Signal<PostWithAuthor | undefined> = computed(() => {
    const post = this.postByIdResource.value();
    if (!post) {
      return undefined;
    }
    return { ...post, author: this.userMap().get(String(post.userId)) };
  });

  readonly isLoading = this.postsResource.isLoading;
  readonly error = this.postsResource.error;

  readonly postLoading = this.postByIdResource.isLoading;
  readonly postError = this.postByIdResource.error;

  /**
   * Obtiene un post específico por su ID.
   * @param id - ID del post a obtener
   */
  getPostById(id: string): Signal<PostWithAuthor | undefined> {
    this.selectedPostId.set(id);
    return this.selectedPost;
  }

  /**
   * Limpia la selección del post actual.
   */
  clearSelectedPost(): void {
    this.selectedPostId.set(undefined);
  }

  /**
   * Crea un nuevo post y refresca el listado.
   * @param payload - Datos del post a crear
   */
  async createPost(payload: CreatePostPayload): Promise<Post> {
    const post = await firstValueFrom(
      this.http.post<Post>(this.apiUrl, {
        ...payload,
        createdAt: new Date().toISOString(),
      }),
    );
    this.postsResource.reload();
    return post;
  }

  /**
   * Actualiza un post existente y refresca el listado y, si aplica, el post seleccionado.
   * @param id - ID del post a editar
   * @param payload - Campos a actualizar
   */
  async updatePost(id: string, payload: UpdatePostPayload): Promise<Post> {
    const post = await firstValueFrom(this.http.patch<Post>(`${this.apiUrl}/${id}`, payload));
    this.postsResource.reload();
    if (this.selectedPostId() === id) {
      this.postByIdResource.reload();
    }
    return post;
  }

  /**
   * Borra un post y refresca el listado.
   * @param id - ID del post a borrar
   */
  async deletePost(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
    this.postsResource.reload();
    if (this.selectedPostId() === id) {
      this.clearSelectedPost();
    }
  }
}
