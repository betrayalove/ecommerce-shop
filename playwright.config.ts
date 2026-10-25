import { defineConfig, devices } from '@playwright/test';
const port = process.env.WEB_PORT || '4373';
const baseURL = process.env.BASE_URL || `http://localhost:${port}`;
const preview = process.env.E2E_PREVIEW !== 'false';
export default defineConfig({
  testDir: './e2e', fullyParallel: false, forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, workers: 1, reporter: 'list',
  timeout: 30000, expect: { timeout: 10000 },
  use: { baseURL, trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: preview ? { command: 'npm run preview', url: `${baseURL}/api/products`, reuseExistingServer: false, timeout: 30000, env: { WEB_PORT: port, NODE_ENV: 'test' } } : [
    { command: 'npm run server', url: 'http://localhost:3180/health', reuseExistingServer: false, env: { PORT: '3180', NODE_ENV: 'test' } },
    { command: 'npm run dev', url: baseURL, reuseExistingServer: false, env: { WEB_PORT: port, PORT: '3180', API_ORIGIN: 'http://localhost:3180' } },
  ],
});
