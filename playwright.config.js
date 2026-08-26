import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: process.env.CI ? [['list'], ['github']] : [['list']],
  projects: [
    {
      name: 'engine',
      testMatch: /engine\.spec\.ts$/
    },
    {
      name: 'browser',
      testMatch: /(smoke\.spec\.js|harms\.spec\.ts|graph\.spec\.ts|site\.spec\.ts)$/,
      use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173',
        headless: true,
        screenshot: 'only-on-failure',
        trace: 'on-first-retry'
      }
    }
  ]
});
