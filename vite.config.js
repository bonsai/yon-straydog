import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  base: './',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5000,
  },
  optimizeDeps: {
    entries: ['index.html'],
  },
})
