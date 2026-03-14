import { test, expect } from '@playwright/test';

test.describe('Каталог', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('страница каталога загружает карточки товаров и кнопки «В корзину»', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForResponse((res) => res.url().includes('/api/products') && res.status() === 200, { timeout: 20000 }).catch(() => {});
    await expect(page.getByRole('heading', { name: /каталог/i })).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Смартфон X1')).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('button', { name: /в корзину/i }).first()).toBeVisible();
  });

  test('фильтр по категории «Электроника» скрывает товары других категорий', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForResponse((res) => res.url().includes('/api/products') && res.status() === 200, { timeout: 20000 }).catch(() => {});
    await expect(page.getByText('Смартфон X1')).toBeVisible({ timeout: 20000 });
    await page.getByRole('combobox').selectOption('electronics');
    await expect(page.getByText('Смартфон X1')).toBeVisible();
    await expect(page.getByText('Футболка Classic')).not.toBeVisible();
  });

  test('клик по названию товара открывает страницу товара с ценой и кнопкой «В корзину»', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForResponse((res) => res.url().includes('/api/products') && res.status() === 200, { timeout: 20000 }).catch(() => {});
    await expect(page.getByText('Смартфон X1')).toBeVisible({ timeout: 20000 });
    await page.getByRole('link', { name: /смартфон x1/i }).first().click();
    await expect(page).toHaveURL(/\/product\/1/);
    await expect(page.getByRole('heading', { name: /смартфон x1/i })).toBeVisible();
    await expect(page.getByText(/29\s*990/)).toBeVisible();
    await expect(page.getByRole('button', { name: /в корзину/i })).toBeVisible();
  });
});
