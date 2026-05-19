import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    __USE_MOCK__: 'false',
  },
  test: {
    include: [],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
    },
    projects: [
      {
        test: {
          name: 'server',
          include: ['server/src/**/*.test.ts'],
          environment: 'node',
          globals: true,
        },
      },
      {
        test: {
          name: 'frontend',
          include: ['src/**/*.test.{ts,tsx}'],
          environment: 'jsdom',
          setupFiles: ['src/test/setup.ts'],
          css: true,
          globals: true,
        },
        plugins: [react()],
        define: {
          __USE_MOCK__: 'false',
        },
      },
    ],
  },
})
