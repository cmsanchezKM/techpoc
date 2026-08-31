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

type RawComment = Omit<Comment, 'id' | 'postId' | 'userId'> & {
  id: string;
  postId: string;
  userId: string;
};

/** Datos necesarios para crear un comentario nuevo. */
export type CreateCommentPayload = Omit<Comment, 'id' | 'createdAt'>;

@Injectable({ providedIn: 'root' })
export class CommentsApi {
  private http = inject(HttpClient);
  private usersApi = inject(UsersApi);

  private apiUrl = `${API_BASE}/comments`;

  private readonly selectedPostId = signal<string | undefined>(undefined);
  private readonly optimisticCommentsByPost = signal<Record<string, Comment[]>>({});

  private readonly commentsResource = httpResource<RawComment[]>(() => {
    const postId = this.selectedPostId();
    return postId !== undefined ? `${this.apiUrl}?postId=${postId}` : undefined;
  });

  // Mapa de usuarios por ID para resolver el autor de cada comentario
  private readonly userMap = computed(() => {
    const map = new Map<string, User>();
    for (const user of this.usersApi.users()) {
      map.set(user.id, user);
    }
    return map;
  });

  private normalizeComment(comment: RawComment): Comment {
    return { ...comment };
  }

  /** Comentarios del post seleccionado, ordenados del más antiguo al más reciente. */
  readonly comments: Signal<CommentWithAuthor[]> = computed(() => {
    const postId = this.selectedPostId();
    const comments = (this.commentsResource.value() ?? []).map((comment) =>
      this.normalizeComment(comment),
    );
    const optimisticComments =
      postId !== undefined ? (this.optimisticCommentsByPost()[postId] ?? []) : [];
    const users = this.userMap();
    const mergedComments = [...comments, ...optimisticComments];
    const uniqueComments = Array.from(
      new Map(mergedComments.map((comment) => [String(comment.id), comment])).values(),
    );

    return uniqueComments
      .map((comment) => ({ ...comment, author: users.get(comment.userId) }))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  });

  readonly isLoading = this.commentsResource.isLoading;
  readonly error = this.commentsResource.error;

  /**
   * Carga los comentarios de un post específico.
   * @param postId - ID del post cuyos comentarios se quieren cargar
   */
  loadComments(postId: string): void {
    this.selectedPostId.set(postId);
  }

  /**
   * Crea un nuevo comentario y refresca la lista.
   * @param payload - Datos del comentario a crear
   */
  async addComment(payload: CreateCommentPayload): Promise<Comment> {
    const normalizedPayload = { ...payload };

    const rawComment = await firstValueFrom(
      this.http.post<RawComment>(this.apiUrl, {
        ...normalizedPayload,
        createdAt: new Date().toISOString(),
      }),
    );

    const comment = this.normalizeComment(rawComment);
    this.optimisticCommentsByPost.update((current) => ({
      ...current,
      [normalizedPayload.postId]: [...(current[normalizedPayload.postId] ?? []), comment],
    }));
    this.commentsResource.reload();
    return comment;
  }
}
