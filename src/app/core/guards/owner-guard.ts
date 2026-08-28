import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '@features/auth/data-access/auth.service';
import { Post } from '@core/models/post.model';
import { API_BASE } from 'environments/environment';

/** Impide editar un post que no pertenece al usuario autenticado. */
export const ownerGuard: CanActivateFn = (route) => {
  const http = inject(HttpClient);
  const auth = inject(AuthService);
  const router = inject(Router);

  const postId = route.paramMap.get('id');
  const currentUserId = auth.currentUser()?.id;

  if (!postId || !currentUserId) {
    return of(router.parseUrl('/login'));
  }

  return http.get<Post>(`${API_BASE}/posts/${postId}`).pipe(
    map((post) =>
      String(post.userId) === String(currentUserId) ? true : router.parseUrl(`/posts/${postId}`),
    ),
    catchError(() => of(router.parseUrl('/posts'))),
  );
};
