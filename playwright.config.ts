import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 90000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5000',
    headless: true,
    viewport: { width: 390, height: 844 },
  },
  webServer: {
    command: 'npm run dev',
    port: 5000,
    reuseExistingServer: true,
    timeout: 30000,
  },
  workers: 2,
})
