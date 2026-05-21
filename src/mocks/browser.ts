import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
import { logMock } from './logger'
import { setupMockToggle } from './toggle'
import { logger } from '../lib/logger'

export const worker = setupWorker(...handlers)

export async function startMockServiceWorker() {
  logger.info('MSW', 'Iniciando Mock Service Worker...')

  setupMockToggle()

  try {
    await worker.start({
      onUnhandledRequest(request, print) {
        const url = new URL(request.url)
        if (url.pathname.startsWith('/api/')) {
          logMock(request.method, url.pathname, 501)
          print.warning()
        }
      },
      quiet: false,
    })
    logger.info('MSW', 'Mock Service Worker ativo — todas as APIs estão sendo mockadas')
  } catch (error) {
    logger.warn('MSW', 'Falha ao iniciar MSW', { error: String(error) })
  }
}
