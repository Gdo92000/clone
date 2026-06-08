import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'node:path'
import fs from 'node:fs'

const certsDir = path.resolve(__dirname, 'certs')
const keyPath = path.join(certsDir, 'localhost-key.pem')
const certPath = path.join(certsDir, 'localhost.pem')

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  throw new Error(
    `\n[SSL] Certificados locais não encontrados em ${certsDir}.\n` +
      `[SSL] Execute uma única vez:  npm run setup:dev\n` +
      `[SSL] Requisitos: mkcert instalado e CA local registrada (mkcert -install).\n`,
  )
}

const httpsOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const mockFlag = env['VITE_MOCK'] === 'true' || env['VITE_MOCK_MODE'] === 'true'
  const dbProvider = env['DB_PROVIDER'] === 'memory' || mockFlag ? 'memory' : 'postgres'

  console.log('[vite.config] MOCK:', {
    VITE_MOCK: env['VITE_MOCK'],
    VITE_MOCK_MODE: env['VITE_MOCK_MODE'],
    DB_PROVIDER: env['DB_PROVIDER'],
    resolved: { mockFlag, dbProvider },
  })

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    define: {
      __USE_MOCK__: JSON.stringify(mockFlag),
      __DB_PROVIDER__: JSON.stringify(dbProvider),
    },
    plugins: [
      react(),
      visualizer({
        filename: 'dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: false,
      }),
    ],
    server: {
      host: true,
      https: httpsOptions,
      proxy: {
        '/api/photon': {
          target: 'https://photon.komoot.io',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/photon/, '/api'),
        },
        '/api/nominatim': {
          target: 'https://nominatim.openstreetmap.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/nominatim/, ''),
        },
        '/api/viacep': {
          target: 'https://viacep.com.br',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/viacep/, ''),
        },
        '/api/ipapi': {
          target: 'https://ipapi.co',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/ipapi/, ''),
        },
        '/api/ip-api': {
          target: 'http://ip-api.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/ip-api/, ''),
        },
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/leaflet')) {
              return 'vendor-leaflet';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('node_modules/@tanstack')) {
              return 'vendor-tanstack';
            }
            if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run')) {
              return 'vendor-router';
            }
            if (id.includes('node_modules/')) {
              return 'vendor-other';
            }
          },
        },
      },
    },
  }
})
