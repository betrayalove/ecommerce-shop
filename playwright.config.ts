import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:4173';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  timeout: 60000,
  expect: { timeout: 20000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: [
    {
      command: 'cd server && node index.js',
      url: 'http://localhost:3080/api/products',
      reuseExistingServer: true,
      timeout: 15000,
    },
    {
      command: 'npm run dev',
      url: baseURL,
      reuseExistingServer: true,
      timeout: 20000,
    },
  ],
});
