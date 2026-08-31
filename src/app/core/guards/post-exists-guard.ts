import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { Post } from '@core/models/post.model';
import { API_BASE } from 'environments/environment';

/** Redirige a /not-found si el post de la ruta no existe. */
export const postExistsGuard: CanActivateFn = (route) => {
  const http = inject(HttpClient);
  const router = inject(Router);

  const postId = route.paramMap.get('id');
  if (!postId) {
    return of(router.parseUrl('/not-found'));
  }

  return http.get<Post>(`${API_BASE}/posts/${postId}`).pipe(
    map(() => true),
    catchError(() => of(router.parseUrl('/not-found'))),
  );
};
