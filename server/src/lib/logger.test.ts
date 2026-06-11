import { describe, it, expect, vi, beforeEach } from 'vitest';

const infoMock = vi.fn();
const warnMock = vi.fn();
const errorMock = vi.fn();

vi.mock('pino', () => ({
  default: vi.fn().mockReturnValue({
    info: infoMock,
    warn: warnMock,
    error: errorMock,
  }),
}));

vi.mock('./requestContext', () => ({
  getRequestStore: vi.fn(),
}));

vi.mock('../config', () => ({
  LOG_LEVEL: 'info',
  NODE_ENV: 'test',
}));

describe('logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs info with request context', async () => {
    const { getRequestStore } = await import('./requestContext');
    (getRequestStore as ReturnType<typeof vi.fn>).mockReturnValue({ requestId: 'req-1', userId: 'user-1', tenantId: 'tenant-1' });

    const { logger } = await import('./logger');
    logger.info('Test message', { extra: 'data' });

    expect(infoMock).toHaveBeenCalledWith(
      { requestId: 'req-1', userId: 'user-1', tenantId: 'tenant-1', extra: 'data' },
      'Test message',
    );
  });

  it('logs warn with request context', async () => {
    const { getRequestStore } = await import('./requestContext');
    (getRequestStore as ReturnType<typeof vi.fn>).mockReturnValue({ requestId: 'req-1' });

    const { logger } = await import('./logger');
    logger.warn('Warning message');

    expect(warnMock).toHaveBeenCalledWith({ requestId: 'req-1' }, 'Warning message');
  });

  it('logs error with Error object', async () => {
    const { getRequestStore } = await import('./requestContext');
    (getRequestStore as ReturnType<typeof vi.fn>).mockReturnValue(null);

    const { logger } = await import('./logger');
    const error = new Error('Test error');
    logger.error('Error occurred', error);

    expect(errorMock).toHaveBeenCalledWith({ err: error }, 'Error occurred');
  });

  it('logs error with object', async () => {
    const { getRequestStore } = await import('./requestContext');
    (getRequestStore as ReturnType<typeof vi.fn>).mockReturnValue(null);

    const { logger } = await import('./logger');
    logger.error('Error occurred', { code: 'E123' });

    expect(errorMock).toHaveBeenCalledWith({ code: 'E123' }, 'Error occurred');
  });

  it('logs error without error object', async () => {
    const { getRequestStore } = await import('./requestContext');
    (getRequestStore as ReturnType<typeof vi.fn>).mockReturnValue(null);

    const { logger } = await import('./logger');
    logger.error('Error occurred');

    expect(errorMock).toHaveBeenCalledWith({}, 'Error occurred');
  });

  it('logs without request context when store is null', async () => {
    const { getRequestStore } = await import('./requestContext');
    (getRequestStore as ReturnType<typeof vi.fn>).mockReturnValue(null);

    const { logger } = await import('./logger');
    logger.info('No context');

    expect(infoMock).toHaveBeenCalledWith({}, 'No context');
  });
});