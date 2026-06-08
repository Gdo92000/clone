import { logger as appLogger } from '../lib/logger';

export function logMock(method: string, url: string, status: number, body?: unknown) {
  const color = status >= 400 ? '\x1b[31m' : status >= 300 ? '\x1b[33m' : '\x1b[32m'
  appLogger.debug('MSW', `${color}${method}\x1b[0m ${url} → ${color}${status}\x1b[0m`)
  if (body && import.meta.env.MODE !== 'test') {
    const preview = typeof body === 'object' ? JSON.stringify(body).slice(0, 200) : JSON.stringify(body)
    appLogger.debug('MSW', `↳ ${preview}`)
  }
}

export function logMockError(method: string, url: string, error: unknown) {
  appLogger.error('MSW', `${method} ${url}`, error)
}
