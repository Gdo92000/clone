import type { MiddlewareHandler } from 'hono';
import { Counter, Histogram, Gauge, collectDefaultMetrics, register } from 'prom-client';

collectDefaultMetrics({ prefix: 'fluxds_' });

export const httpRequestCount = new Counter({
  name: 'fluxds_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status_code'] as const,
});

export const httpRequestDuration = new Histogram({
  name: 'fluxds_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path'] as const,
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

export const httpErrorCount = new Counter({
  name: 'fluxds_http_errors_total',
  help: 'Total HTTP errors by status range',
  labelNames: ['method', 'path', 'status_range'] as const,
});

export const activeRequests = new Gauge({
  name: 'fluxds_http_requests_active',
  help: 'Currently active HTTP requests',
});

export function pathPattern(path: string): string {
  return path.replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:uuid')
    .replace(/\/[0-9]+/g, '/:id');
}

export const metricsHandler: MiddlewareHandler = async (c, next) => {
  const method = c.req.method;
  const rawPath = c.req.path;
  const pattern = pathPattern(rawPath);

  activeRequests.inc();
  const start = Date.now();

  try {
    await next();
  } finally {
    const duration = (Date.now() - start) / 1000;
    const status = c.res.status;
    const statusRange = `${Math.floor(status / 100)}xx`;

    activeRequests.dec();
    httpRequestCount.inc({ method, path: pattern, status_code: status });
    httpRequestDuration.observe({ method, path: pattern }, duration);

    if (status >= 400) {
      httpErrorCount.inc({ method, path: pattern, status_range: statusRange });
    }
  }
};

export async function getMetrics(): Promise<string> {
  return register.metrics();
}
