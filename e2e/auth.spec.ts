import { test, expect } from '@playwright/test';

test.describe('Авторизация', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('форма входа отображается и при успехе редиректит в каталог', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: /вход/i })).toBeVisible({ timeout: 20000 });
    await page.getByLabel(/email/i).fill('admin@test.com');
    await page.getByLabel(/пароль/i).fill('123456');
    await page.locator('form').getByRole('button', { name: /войти/i }).click();
    await expect(page).toHaveURL('/catalog');
    await expect(page.getByRole('button', { name: /выйти/i })).toBeVisible();
  });

  test('после входа в хедере отображаются имя и кнопка «Выйти»', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByLabel(/email/i)).toBeVisible({ timeout: 20000 });
    await page.getByLabel(/email/i).fill('admin@test.com');
    await page.getByLabel(/пароль/i).fill('123456');
    await page.locator('form').getByRole('button', { name: /войти/i }).click();
    await expect(page).toHaveURL('/catalog');
    await expect(page.getByText(/admin|admin@test.com/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /выйти/i })).toBeVisible();
  });

  test('выход очищает сессию и показывает ссылки Войти и Регистрация', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByLabel(/email/i)).toBeVisible({ timeout: 20000 });
    await page.getByLabel(/email/i).fill('admin@test.com');
    await page.getByLabel(/пароль/i).fill('123456');
    await page.locator('form').getByRole('button', { name: /войти/i }).click();
    await expect(page).toHaveURL('/catalog');
    await page.getByRole('button', { name: /выйти/i }).click();
    await expect(page.getByRole('link', { name: /войти/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /регистрация/i })).toBeVisible();
  });

  test('без токена переход на /account редиректит на /login', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/account');
    await expect(page).toHaveURL('/login', { timeout: 15000 });
  });

  test('форма регистрации отображается и при успехе редиректит в каталог', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: /регистрация/i })).toBeVisible({ timeout: 20000 });
    const email = `e2e-${Date.now()}@example.com`;
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/пароль/i).fill('password123');
    await page.getByRole('button', { name: /зарегистрироваться/i }).click();
    await expect(page).toHaveURL('/catalog');
  });
});
