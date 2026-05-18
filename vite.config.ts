import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig(({ mode }) => ({
  define: {
    __USE_MOCK__: JSON.stringify(mode === 'development' && process.env.VITE_MOCK === 'true'),
  },
  plugins: [
    react(),
    basicSsl(),
  ],
  server: {
    host: true,
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
      '/api/restaurants': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
        '/api/health': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
        '/api/operations': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
        '/api/holidays': {
          target: 'http://localhost:3001',
          changeOrigin: true,
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
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          if (id.includes('node_modules/')) {
            return 'vendor-other';
          }
        },
      },
    },
  },
}))
