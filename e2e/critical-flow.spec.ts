import { test, expect } from './fixtures';

const MOCK_USERS = [
  {
    id: '1',
    name: 'alice',
    password: 'alice123',
    email: 'alice@example.com',
    avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=alice',
  },
];

interface MockPost {
  id: string;
  userId: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
}

interface MockComment {
  id: string;
  postId: string;
  userId: string;
  body: string;
  createdAt: string;
}

test.describe('Flujo crítico', () => {
  test('login, CRUD completo de un post y alta de comentario', async ({ page }) => {
    const posts: MockPost[] = [];
    const comments: MockComment[] = [];
    let nextPostId = 1;
    let nextCommentId = 1;

    await page.route('**/users', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_USERS),
      }),
    );

    // Backend en memoria para /posts: soporta listado, alta, lectura, edición y borrado.
    await page.route('http://localhost:3000/posts', async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        const payload = request.postDataJSON();
        const created: MockPost = {
          id: String(nextPostId++),
          createdAt: new Date().toISOString(),
          ...payload,
        };
        posts.push(created);
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(created),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(posts),
      });
    });

    await page.route('http://localhost:3000/posts/*', async (route) => {
      const request = route.request();
      const id = new URL(request.url()).pathname.split('/').pop();
      const index = posts.findIndex((post) => post.id === id);

      if (request.method() === 'PATCH') {
        posts[index] = { ...posts[index], ...request.postDataJSON() };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(posts[index]),
        });
        return;
      }

      if (request.method() === 'DELETE') {
        posts.splice(index, 1);
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
        return;
      }

      if (index === -1) {
        await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(posts[index]),
      });
    });

    // Backend en memoria para /comments: listado filtrado por post y alta.
    await page.route(/http:\/\/localhost:3000\/comments(\?.*)?$/, async (route) => {
      const request = route.request();

      if (request.method() === 'POST') {
        const payload = request.postDataJSON();
        const created: MockComment = {
          id: String(nextCommentId++),
          createdAt: new Date().toISOString(),
          ...payload,
        };
        comments.push(created);
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(created),
        });
        return;
      }

      const postId = new URL(request.url()).searchParams.get('postId');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(comments.filter((comment) => comment.postId === postId)),
      });
    });

    // 1. Login
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('Usuario').fill('alice');
    await page.getByPlaceholder('••••••••').fill('alice123');
    await page.getByRole('button', { name: 'Acceder al sistema' }).click();
    await expect(page).toHaveURL(/\/posts$/);

    // 2. Create
    await page.getByRole('button', { name: 'Nuevo post' }).click();
    await expect(page).toHaveURL(/\/posts\/new$/);
    await page.waitForLoadState('networkidle');
    await page.getByLabel('Título').fill('post de prueba');
    await page.getByLabel('Contenido').fill('Contenido inicial del post de prueba.');
    await page.getByLabel('Tags').fill('e2e, critico');
    await page.getByRole('button', { name: 'Publicar' }).click();
    await expect(page).toHaveURL(/\/posts\/1$/);

    // 3. Read
    await expect(page.getByRole('heading', { name: 'Post De Prueba' })).toBeVisible();
    await expect(page.getByText('Contenido inicial del post de prueba.')).toBeVisible();

    // 4. Update
    await page.getByRole('button', { name: 'Editar' }).click();
    await expect(page).toHaveURL(/\/posts\/1\/edit$/);
    await page.waitForLoadState('networkidle');
    await page.getByLabel('Título').fill('post de prueba editado');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page).toHaveURL(/\/posts\/1$/);
    await expect(page.getByRole('heading', { name: 'Post De Prueba Editado' })).toBeVisible();

    // 5. Comment
    await page.getByLabel('Añadir comentario').fill('¡Excelente post!');
    await page.getByRole('button', { name: 'Publicar comentario' }).click();
    await expect(page.getByText('¡Excelente post!')).toBeVisible();

    // 6. Intenta editar un post que no le pertenece
    posts.push({
      id: '2',
      userId: '2',
      title: 'Post de otro usuario',
      body: 'Cuerpo',
      tags: [],
      createdAt: new Date().toISOString(),
    });
    await page.goto('/posts/2/edit');
    await expect(page).toHaveURL(/\/forbidden$/);
    await expect(page.getByRole('heading', { name: 'Acceso denegado' })).toBeVisible();
    await expect(page.getByText('No tienes permiso para acceder a este recurso.')).toBeVisible();

    // 7. Delete (retoma el post propio para cerrar el flujo)
    await page.goto('/posts/1');
    await page.waitForLoadState('networkidle');
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Eliminar' }).click();
    await expect(page).toHaveURL(/\/posts$/);
  });
});
