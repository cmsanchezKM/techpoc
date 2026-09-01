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

const OTHERS_POST = {
  id: '2',
  userId: '2',
  title: 'Post de otro usuario',
  body: 'Cuerpo',
  tags: ['angular'],
  createdAt: '2026-01-01T00:00:00.000Z',
};

async function login(page: Page) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder('Usuario').fill('alice');
  await page.getByPlaceholder('••••••••').fill('alice123');
  await page.getByRole('button', { name: 'Acceder al sistema' }).click();
  await expect(page).toHaveURL(/\/posts$/);
}

test.describe('Páginas de error', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/users', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_USERS),
      }),
    );

    await login(page);
  });

  test('muestra la página de acceso denegado al editar un post de otro usuario', async ({
    page,
  }) => {
    await page.route('http://localhost:3000/posts/2', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(OTHERS_POST),
      }),
    );

    await page.goto('/posts/2/edit');

    await expect(page).toHaveURL(/\/forbidden$/);
    await expect(page.getByRole('heading', { name: 'Acceso denegado' })).toBeVisible();
    await expect(page.getByText('No tienes permiso para acceder a este recurso.')).toBeVisible();

    await page.getByRole('link', { name: 'Volver al inicio' }).click();
    await expect(page).toHaveURL(/\/posts$/);
  });

  test('muestra la página de no encontrado al abrir un post inexistente', async ({ page }) => {
    await page.route('http://localhost:3000/posts/999', (route) =>
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({}),
      }),
    );

    await page.goto('/posts/999');

    await expect(page).toHaveURL(/\/not-found$/);
    await expect(page.getByRole('heading', { name: 'Página no encontrada' })).toBeVisible();
    await expect(page.getByText('El recurso que buscas no existe o fue eliminado.')).toBeVisible();
  });
});
