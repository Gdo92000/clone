import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

function getMockFlag(): boolean {
  return process.env['VITE_MOCK'] === 'true'
}

export default defineConfig({
  plugins: [react()],
  define: {
    __USE_MOCK__: getMockFlag(),
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
          name: 'server-routes',
          include: ['server/src/routes/routes.test.ts'],
          environment: 'node',
          globals: true,
          pool: 'forks',
          poolOptions: {
            threads: {
              singleFork: true,
            },
          },
        },
      },
      {
        test: {
          name: 'server',
          include: ['server/src/**/*.test.ts'],
          exclude: ['server/src/routes/routes.test.ts'],
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
          __USE_MOCK__: getMockFlag(),
        },
      },
    ],
  },
})
