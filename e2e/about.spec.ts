import { test, expect } from '@playwright/test';

test.describe('О нас и навигация', () => {
  test('переход по ссылке «О нас» открывает страницу с заголовком', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForResponse((res) => res.url().includes('/api/products') && res.status() === 200, { timeout: 20000 }).catch(() => {});
    await expect(page.getByRole('link', { name: /о нас/i })).toBeVisible({ timeout: 20000 });
    await page.getByRole('link', { name: /о нас/i }).click();
    await expect(page).toHaveURL('/about');
    await expect(page.getByRole('heading', { name: /о нас/i })).toBeVisible();
  });

  test('из «О нас» по ссылке «Каталог» возвращает в каталог', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('link', { name: /каталог/i }).first()).toBeVisible({ timeout: 20000 });
    await page.getByRole('link', { name: /каталог/i }).first().click();
    await expect(page).toHaveURL('/catalog');
  });
});
