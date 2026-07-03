import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '/gdog.png': `${__dirname}/public/gdog.png`,
      '/gdog-square.png': `${__dirname}/public/gdog-square.png`,
      '/0.jpg': `${__dirname}/public/gdog.png`,
      '/0.jpeg': `${__dirname}/public/gdog.png`,
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'jsdom',
    setupFiles: ['src/__tests__/setup.ts'],
  },
})
