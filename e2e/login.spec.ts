import { test, expect } from '@playwright/test';

const MOCK_USERS = [
  {
    id: '1',
    name: 'alice',
    password: 'alice123',
    email: 'alice@example.com',
    avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=alice',
  },
];

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/users', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_USERS),
      }),
    );
    await page.goto('/login');
    // Espera a que Angular termine de hidratar el formulario (SSR) antes de
    // interactuar; si no, los eventos de `fill()` pueden perderse.
    await page.waitForLoadState('networkidle');
  });

  test('el botón de acceder está deshabilitado si el formulario está vacío', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Acceder al sistema' })).toBeDisabled();
  });

  test('inicia sesión con credenciales válidas y navega a /posts', async ({ page }) => {
    await page.getByPlaceholder('Usuario').fill('alice');
    await page.getByPlaceholder('••••••••').fill('alice123');
    await page.getByRole('button', { name: 'Acceder al sistema' }).click();

    await expect(page).toHaveURL(/\/posts$/);
  });

  test('muestra un mensaje de error con credenciales inválidas', async ({ page }) => {
    await page.getByPlaceholder('Usuario').fill('alice');
    await page.getByPlaceholder('••••••••').fill('password-incorrecto');
    await page.getByRole('button', { name: 'Acceder al sistema' }).click();

    await expect(page.getByText('Credenciales inválidas')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('el mensaje de error se puede cerrar', async ({ page }) => {
    await page.getByPlaceholder('Usuario').fill('alice');
    await page.getByPlaceholder('••••••••').fill('password-incorrecto');
    await page.getByRole('button', { name: 'Acceder al sistema' }).click();

    await expect(page.getByText('Credenciales inválidas')).toBeVisible();
    await page.getByRole('button', { name: 'Cerrar mensaje de error' }).click();
    await expect(page.getByText('Credenciales inválidas')).toBeHidden();
  });
});
