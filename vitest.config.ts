import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

function getMockFlag(): boolean {
  return process.env['VITE_MOCK'] === 'true'
}

function getMockRestaurantsFlag(): boolean {
  return process.env['VITE_MOCK_RESTAURANTS'] === 'true'
}

function getMockOrdersFlag(): boolean {
  return process.env['VITE_MOCK_ORDERS'] === 'true'
}

function getDbProvider(): string {
  return process.env['VITE_DB_PROVIDER'] ?? 'memory'
}

const srcDir = fileURLToPath(new URL('./src', import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': srcDir,
      'src': srcDir,
    },
  },
  define: {
    __USE_MOCK__: getMockFlag(),
    __MOCK_RESTAURANTS__: getMockRestaurantsFlag(),
    __MOCK_ORDERS__: getMockOrdersFlag(),
    __DB_PROVIDER__: JSON.stringify(getDbProvider()),
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
          __MOCK_RESTAURANTS__: getMockRestaurantsFlag(),
          __MOCK_ORDERS__: getMockOrdersFlag(),
          __DB_PROVIDER__: JSON.stringify(getDbProvider()),
        },
        resolve: {
          alias: {
            '@': srcDir,
            'src': srcDir,
          },
        },
      },
    ],
  },
})
