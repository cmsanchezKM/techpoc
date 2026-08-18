import { HttpClient, httpResource } from '@angular/common/http';
import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Comment } from '@core/models/comment.model';
import { User } from '@core/models/user.model';
import { UsersApi } from '@features/users/data-access/users-api';
import { API_BASE } from 'environments/environment';

/** Comentario enriquecido con el objeto de usuario del autor. */
export interface CommentWithAuthor extends Comment {
  author?: User;
}

/** Datos necesarios para crear un comentario nuevo. */
export type CreateCommentPayload = Omit<Comment, 'id' | 'createdAt'>;

@Injectable({ providedIn: 'root' })
export class CommentsApi {
  private http = inject(HttpClient);
  private usersApi = inject(UsersApi);

  private apiUrl = `${API_BASE}/comments`;

  private readonly selectedPostId = signal<number | undefined>(undefined);

  private readonly commentsResource = httpResource<Comment[]>(() => {
    const postId = this.selectedPostId();
    return postId !== undefined ? `${this.apiUrl}?postId=${postId}` : undefined;
  });

  // Mapa de usuarios por ID para resolver el autor de cada comentario
  private readonly userMap = computed(() => {
    const map = new Map<string, User>();
    for (const user of this.usersApi.users()) {
      map.set(String(user.id), user);
    }
    return map;
  });

  /** Comentarios del post seleccionado, ordenados del más antiguo al más reciente. */
  readonly comments: Signal<CommentWithAuthor[]> = computed(() => {
    const comments = this.commentsResource.value() ?? [];
    const users = this.userMap();
    return [...comments]
      .map((comment) => ({ ...comment, author: users.get(String(comment.userId)) }))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  });

  readonly isLoading = this.commentsResource.isLoading;
  readonly error = this.commentsResource.error;

  /**
   * Carga los comentarios de un post específico.
   * @param postId - ID del post cuyos comentarios se quieren cargar
   */
  loadComments(postId: number): void {
    this.selectedPostId.set(postId);
  }

  /**
   * Crea un nuevo comentario y refresca la lista.
   * @param payload - Datos del comentario a crear
   */
  async addComment(payload: CreateCommentPayload): Promise<Comment> {
    const comment = await firstValueFrom(
      this.http.post<Comment>(this.apiUrl, {
        ...payload,
        createdAt: new Date().toISOString(),
      }),
    );
    this.commentsResource.reload();
    return comment;
  }
}
