import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'login',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'posts',
    renderMode: RenderMode.Server,
  },
  {
    path: 'posts/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'posts/new',
    renderMode: RenderMode.Client,
  },
  {
    path: 'posts/:id/edit',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
