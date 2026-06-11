import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

const mocks = vi.hoisted(() => {
  const mockChain = (result: unknown[]) => ({
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation((cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result))),
  });
  return {
    mockChain,
    dbSelectMock: vi.fn(),
    dbInsertMock: vi.fn(),
    dbDeleteMock: vi.fn(),
    seedHolidaysMock: vi.fn(),
    getHolidaysForDateMock: vi.fn(),
    authMiddlewareImpl: vi.fn(),
  };
});

vi.mock('../db', () => ({
  db: {
    select: mocks.dbSelectMock,
    insert: mocks.dbInsertMock,
    delete: mocks.dbDeleteMock,
  },
}));

vi.mock('../db/schema', () => ({
  holidayRules: {},
  holidayScope: {},
  holidayOverrideType: {},
}));

vi.mock('../services/operations', () => ({
  seedHolidaysForYear: mocks.seedHolidaysMock,
  getHolidaysForDate: mocks.getHolidaysForDateMock,
}));

const mockAuth: MiddlewareHandler = async (c, next) => {
  const auth = c.req.header('Authorization');
  if (!auth) {
    c.status(401);
    return c.json({ error: 'Não autorizado' });
  }
  c.set('jwtPayload', { sub: 'admin-1', role: 'superadmin' });
  await next();
};

const mockPermission: MiddlewareHandler = async (_c, next) => {
  await next();
};

vi.mock('../middleware/auth', () => ({
  authMiddleware: mockAuth,
  getTokenPayload: () => ({ sub: 'admin-1', role: 'superadmin' }),
}));

vi.mock('../middleware/permission', () => ({
  requirePermission: () => mockPermission,
}));

let app: Hono;

beforeAll(async () => {
  const { default: holidaysRoute } = await import('./holidays');
  app = new Hono().route('/', holidaysRoute);
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(mocks.dbSelectMock).mockReset();
  vi.mocked(mocks.dbInsertMock).mockReset();
  vi.mocked(mocks.dbDeleteMock).mockReset();
  vi.mocked(mocks.seedHolidaysMock).mockReset();
  vi.mocked(mocks.getHolidaysForDateMock).mockReset();
});

function mockSelect(result: unknown[]) {
  return mocks.mockChain(result);
}

const AUTH_HEADER = { Authorization: 'Bearer token' };

describe('GET / (list holidays)', () => {
  it('returns all holidays', async () => {
    const holidays = [
      { id: '1', name: 'Natal', date: '2026-12-25', scope: 'national', is_recurring: true },
    ];
    vi.mocked(mocks.dbSelectMock).mockReturnValue(mockSelect(holidays));

    const res = await app.request('/');
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(body).toEqual(holidays);
  });

  it('is public (no auth required)', async () => {
    vi.mocked(mocks.dbSelectMock).mockReturnValue(mockSelect([]));
    const res = await app.request('/');
    expect(res.status).toBe(200);
  });
});

describe('GET /date/:date (get holidays for date)', () => {
  it('returns holidays for valid date', async () => {
    const result = [{ name: 'Natal', scope: 'national' }];
    vi.mocked(mocks.getHolidaysForDateMock).mockResolvedValue(result);

    const res = await app.request('/date/2026-12-25');
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(body).toEqual(result);
  });

  it('returns 400 for invalid date format', async () => {
    const res = await app.request('/date/25-12-2026');
    expect(res.status).toBe(400);
  });

  it('is public (no auth required)', async () => {
    vi.mocked(mocks.getHolidaysForDateMock).mockResolvedValue([]);
    const res = await app.request('/date/2026-12-25');
    expect(res.status).toBe(200);
  });
});

describe('POST / (create holiday)', () => {
  const validBody = {
    name: 'Natal',
    date: '2026-12-25',
    scope: 'national',
    isRecurring: true,
  };

  it('creates a holiday successfully', async () => {
    vi.mocked(mocks.dbInsertMock).mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });

    const res = await app.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...AUTH_HEADER },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expect(body.success).toBe(true);
    expect(body.id).toBeDefined();
  });

  it('returns 401 without auth header', async () => {
    const res = await app.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(401);
  });

  it('returns 400 for missing required fields', async () => {
    const res = await app.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...AUTH_HEADER },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /seed/:year (seed holidays)', () => {
  it('seeds holidays for given year', async () => {
    vi.mocked(mocks.seedHolidaysMock).mockResolvedValue(10);

    const res = await app.request('/seed/2026', {
      method: 'POST',
      headers: AUTH_HEADER,
    });

    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body).toEqual({ seeded: 10, year: 2026 });
  });

  it('returns 401 without auth header', async () => {
    const res = await app.request('/seed/2026', { method: 'POST' });
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid year', async () => {
    const res = await app.request('/seed/1999', {
      method: 'POST',
      headers: AUTH_HEADER,
    });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /:id (delete holiday)', () => {
  it('deletes a holiday by id', async () => {
    vi.mocked(mocks.dbDeleteMock).mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });

    const res = await app.request('/holiday-1', {
      method: 'DELETE',
      headers: AUTH_HEADER,
    });

    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });

  it('returns 401 without auth header', async () => {
    const res = await app.request('/holiday-1', { method: 'DELETE' });
    expect(res.status).toBe(401);
  });
});
