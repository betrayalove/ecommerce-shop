import { test, expect } from '@playwright/test';

test.describe('Корзина', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('пустая корзина показывает текст «Корзина пуста» и ссылку в каталог', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: /корзина/i })).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Корзина пуста')).toBeVisible();
    await expect(page.getByRole('link', { name: /в каталог/i })).toBeVisible();
  });

  test('добавление из каталога и со страницы товара отображается в корзине и в итоге', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForResponse((res) => res.url().includes('/api/products') && res.status() === 200, { timeout: 20000 }).catch(() => {});
    await expect(page.getByText('Смартфон X1')).toBeVisible({ timeout: 20000 });
    await page.getByRole('button', { name: /в корзину/i }).first().click();
    await page.goto('/cart');
    await expect(page.getByText('Смартфон X1')).toBeVisible();
    await expect(page.getByText(/итого/i)).toBeVisible();
    await page.goto('/product/2');
    await page.getByRole('button', { name: /в корзину/i }).click();
    await page.goto('/cart');
    await expect(page.getByText('Ноутбук Pro')).toBeVisible();
  });

  test('изменение количества пересчитывает сумму; удаление убирает позицию и показывает пустое состояние', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForResponse((res) => res.url().includes('/api/products') && res.status() === 200, { timeout: 20000 }).catch(() => {});
    await expect(page.getByRole('button', { name: /в корзину/i }).first()).toBeVisible({ timeout: 20000 });
    await page.getByRole('button', { name: /в корзину/i }).first().click();
    await page.goto('/cart');
    await page.locator('input[type="number"]').first().fill('3');
    await expect(page.getByText(/89\s*970/)).toBeVisible();
    await page.getByRole('button', { name: /удалить/i }).first().click();
    await expect(page.getByText('Корзина пуста')).toBeVisible();
  });
});
