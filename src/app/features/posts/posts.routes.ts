import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth-guard';
import { ownerGuard } from '../../core/guards/owner-guard';
import { postExistsGuard } from '../../core/guards/post-exists-guard';

export const POSTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/post-list').then((m) => m.PostList),
    title: 'Lista de posts · TechPoC',
  },
  {
    path: 'new',
    canActivate: [authGuard],
    loadComponent: () => import('./form/post-form').then((m) => m.PostForm),
    title: 'Nuevo post · TechPoC',
  },
  {
    path: ':id/edit',
    canActivate: [authGuard, ownerGuard],
    loadComponent: () => import('./form/post-form').then((m) => m.PostForm),
    title: 'Editar post · TechPoC',
  },
  {
    path: ':id',
    canActivate: [postExistsGuard],
    loadComponent: () => import('./detail/post-detail').then((m) => m.PostDetail),
    title: 'Post · TechPoC',
  },
];
