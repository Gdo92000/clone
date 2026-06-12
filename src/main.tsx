import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { SEOProvider } from './components/SEO'
import App from './App'

async function bootstrap() {
  if (__USE_MOCK__) {
    const { startMockServiceWorker } = await import('./mocks')
    await startMockServiceWorker()
  }

  const root = document.getElementById('root')
  if (!root) throw new Error('Root element not found')
  createRoot(root).render(
    <StrictMode>
      <SEOProvider>
        <App />
      </SEOProvider>
    </StrictMode>,
  )
}

void bootstrap()
