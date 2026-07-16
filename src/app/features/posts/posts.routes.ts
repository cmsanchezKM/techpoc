import { Routes } from '@angular/router';

export const POSTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/post-list').then((m) => m.PostList),
    title: 'Lista de posts · TechPoC',
  },
  {
    path: 'new',
    loadComponent: () => import('./form/post-form.component').then((m) => m.PostForm),
    title: 'Nuevo post · TechPoC',
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./form/post-form.component').then((m) => m.PostForm),
    title: 'Editar post · TechPoC',
  },
  {
    path: ':id',
    loadComponent: () => import('./detail/post-detail.component').then((m) => m.PostDetail),
    title: 'Post · TechPoC',
  },
];
