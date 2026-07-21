import { test, expect } from '@playwright/test';

test.describe('Posts Flow', () => {
  test('should filter posts and navigate to post details', async ({ page }) => {
    await page.goto('/posts');

    // Type query into search field
    const searchInput = page.getByRole('textbox');
    await searchInput.fill('Angular');

    // Click on the first card to view details
    await page.click('.card-item:first-child');

    // Verify dynamic route navigation
    await expect(page).toHaveURL(/\/posts\/\d+/);
  });
});
