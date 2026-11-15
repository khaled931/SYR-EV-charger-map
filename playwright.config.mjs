import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 110_000,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'https://ev.syrianrenewables.com',
  },
});
