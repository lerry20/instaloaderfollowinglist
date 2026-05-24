/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Vitest config kept separate from vite.config.ts so the production build
// doesn't load test-only deps (jsdom, fake-indexeddb).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['node_modules', 'dist'],
  },
  // Vitest 4 moved pool / poolOptions out of test{}.
  pool: 'threads',
  poolOptions: {
    threads: { singleThread: true },
  },
})
