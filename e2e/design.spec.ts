import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';

async function checkReadableLayout(page: Page) {
  const result = await page.evaluate(() => {
    const rgb = (s: string) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
    const luminance = (s: string) => rgb(s).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
    const background = (el: Element): string => {
      const value = getComputedStyle(el).backgroundColor;
      return value === 'rgba(0, 0, 0, 0)' && el.parentElement ? background(el.parentElement) : value;
    };
    const contrast = (el: Element) => {
      const a = luminance(getComputedStyle(el).color), b = luminance(background(el));
      return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    };
    const elements = [...document.querySelectorAll('main h1, main h2, main h3, main p, main label, main dt, main dd, input, select, .button, .header__link, .header__logo')].filter(el => el.getBoundingClientRect().width > 0);
    return {
      overflow: document.documentElement.scrollWidth > innerWidth,
      failures: elements.map(el => ({ text: el.textContent?.slice(0, 60) || el.tagName, ratio: contrast(el) })).filter(item => item.ratio < 4.5),
    };
  });
  expect(result.overflow, 'page must fit viewport').toBe(false);
  expect(result.failures, 'visible text and controls must meet 4.5:1 contrast').toEqual([]);
}

for (const width of [390, 1440]) {
  for (const theme of ['light', 'dark']) {
    test(`${theme} theme stays readable across shop pages at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.addInitScript(value => localStorage.setItem('theme', value), theme);
      const capture = async (name: string) => {
        await checkReadableLayout(page);
        await page.screenshot({ path: process.env.DESIGN_SCREENSHOT_DIR ? path.join(process.env.DESIGN_SCREENSHOT_DIR, `${theme}-${width}-${name}.png`) : testInfo.outputPath(`${name}.png`), fullPage: true });
      };
      await page.goto('/catalog');
      await expect(page.getByText('Смартфон X1')).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect.poll(() => page.locator('.product-card__image').evaluateAll(images => images.every(img => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0))).toBe(true);
      await capture('catalog');
      const [surface, backdrop] = await page.locator('.card').first().evaluate(el => [getComputedStyle(el).backgroundColor, getComputedStyle(document.querySelector('.layout')!).backgroundColor]);
      expect(surface, 'cards must remain distinct from the page').not.toBe(backdrop);
      await page.getByRole('link', { name: /смартфон x1/i }).first().click();
      await expect(page.getByRole('heading', { name: 'Смартфон X1' })).toBeVisible();
      await capture('product');
      await page.getByRole('button', { name: 'В корзину', exact: true }).click();
      await page.getByRole('link', { name: /Корзина/ }).click();
      await expect(page.locator('.cart-page__item')).toBeVisible();
      await capture('cart');
      for (const route of ['about', 'register', 'login']) {
        await page.goto(`/${route}`);
        await expect(page.locator('main h1')).toBeVisible();
        await capture(route);
      }
      await page.getByLabel(/email/i).fill('admin@test.com');
      await page.getByLabel(/пароль/i).fill('123456');
      await page.locator('form').getByRole('button', { name: 'Войти', exact: true }).click();
      await expect(page).toHaveURL('/catalog');
      await page.getByRole('link', { name: 'Мой аккаунт' }).click();
      await expect(page.getByRole('heading', { name: 'Мой аккаунт' })).toBeVisible();
      await capture('account');
    });
  }
}

test('theme toggle updates all surfaces and survives reload', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/login');
  await page.getByRole('button', { name: 'Включить тёмную тему' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  await checkReadableLayout(page);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Включить светлую тему' })).toBeVisible();
  await page.getByRole('button', { name: 'Включить светлую тему' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await checkReadableLayout(page);
});

test('a failed product image gets a readable local fallback', async ({ page }) => {
  await page.route('**/missing-product-image.svg', route => route.abort());
  await page.route('**/api/products', async route => {
    const response = await route.fetch();
    const products = await response.json();
    products[0].image = '/missing-product-image.svg';
    await route.fulfill({ response, json: products });
  });
  await page.goto('/catalog');
  const image = page.locator('.product-card__image').first();
  await expect(image).toHaveAttribute('alt', 'Смартфон X1');
  await expect.poll(() => image.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
  await expect(image).toHaveAttribute('src', /^data:image\/svg\+xml/);
});
