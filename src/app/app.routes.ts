import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
    title: 'Login · TechPoC',
  },
  {
    path: 'forbidden',
    data: { code: 403 },
    loadComponent: () => import('./shared/error-page/error-page').then((m) => m.ErrorPage),
    title: 'Acceso denegado · TechPoC',
  },
  {
    path: 'not-found',
    data: { code: 404 },
    loadComponent: () => import('./shared/error-page/error-page').then((m) => m.ErrorPage),
    title: 'Página no encontrada · TechPoC',
  },
  {
    path: 'posts',
    loadChildren: () => import('./features/posts/posts.routes').then((m) => m.POSTS_ROUTES),
  },
  { path: '', pathMatch: 'full', redirectTo: 'posts' },
  { path: '**', redirectTo: 'not-found' },
];
