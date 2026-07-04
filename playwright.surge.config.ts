import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: 'surge-flow.spec.ts',
  timeout: 15000,
  retries: 1,
  use: {
    baseURL: 'https://straydog.surge.sh',
    headless: true,
    viewport: { width: 390, height: 844 },
  },
  workers: 1,
})
