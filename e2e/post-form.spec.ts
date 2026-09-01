import { Page } from '@playwright/test';
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

const MOCK_POSTS = [
  {
    id: '1',
    userId: '1',
    title: 'Post existente',
    body: 'Cuerpo existente',
    tags: ['angular'],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

async function login(page: Page) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder('Usuario').fill('alice');
  await page.getByPlaceholder('••••••••').fill('alice123');
  await page.getByRole('button', { name: 'Acceder al sistema' }).click();
  await expect(page).toHaveURL(/\/posts$/);
}

test.describe('Formulario de post', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/users', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_USERS),
      }),
    );

    await page.route('http://localhost:3000/posts', async (route) => {
      if (route.request().method() === 'POST') {
        const payload = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: '99', ...payload }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_POSTS),
      });
    });

    await page.route('http://localhost:3000/posts/*', async (route) => {
      const id = new URL(route.request().url()).pathname.split('/').pop();
      const existing = MOCK_POSTS.find((post) => post.id === id);

      if (route.request().method() === 'PATCH') {
        const payload = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...existing, ...payload }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(existing),
      });
    });

    await login(page);
  });

  test('el botón de publicar está deshabilitado si el formulario está vacío', async ({ page }) => {
    await page.goto('/posts/new');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: 'Publicar' })).toBeDisabled();
  });

  test('crea un post y navega a su detalle', async ({ page }) => {
    await page.goto('/posts/new');
    await page.waitForLoadState('networkidle');

    await page.getByLabel('Título').fill('Mi primer post');
    await page.getByLabel('Contenido').fill('Contenido de prueba');
    await page.getByLabel('Tags').fill('angular, signals');
    await page.getByRole('button', { name: 'Publicar' }).click();

    await expect(page).toHaveURL(/\/posts\/99$/);
  });

  test('muestra un mensaje de error si falla la creación del post', async ({ page }) => {
    await page.route('http://localhost:3000/posts', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal error' }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_POSTS),
      });
    });

    await page.goto('/posts/new');
    await page.waitForLoadState('networkidle');
    await page.getByLabel('Título').fill('Mi primer post');
    await page.getByLabel('Contenido').fill('Contenido de prueba');
    await page.getByRole('button', { name: 'Publicar' }).click();

    await expect(page.getByText('Hubo un error al guardar el post.')).toBeVisible();
    await expect(page).toHaveURL(/\/posts\/new$/);
  });

  test('precarga el formulario en modo edición y guarda los cambios', async ({ page }) => {
    await page.goto('/posts/1/edit');
    await page.waitForLoadState('networkidle');

    await expect(page.getByLabel('Título')).toHaveValue('Post existente');
    await expect(page.getByLabel('Contenido')).toHaveValue('Cuerpo existente');

    await page.getByLabel('Título').fill('Post editado');
    await page.getByRole('button', { name: 'Guardar' }).click();

    await expect(page).toHaveURL(/\/posts\/1$/);
  });

  test('el botón cancelar vuelve al listado de posts al crear', async ({ page }) => {
    await page.goto('/posts/new');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Cancelar' }).click();

    await expect(page).toHaveURL(/\/posts$/);
  });

  test('el botón cancelar vuelve al detalle del post al editar', async ({ page }) => {
    await page.goto('/posts/1/edit');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Cancelar' }).click();

    await expect(page).toHaveURL(/\/posts\/1$/);
  });

  test('redirige a /login si se intenta crear un post sin sesión iniciada', async ({
    page,
    context,
  }) => {
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());

    await page.goto('/posts/new');

    await expect(page).toHaveURL(/\/login$/);
  });
});
