import { AppError, notFound, badRequest, conflict, unauthorized, errorHandler } from './errors';

describe('AppError', () => {
  it('sets name to AppError', () => {
    const err = new AppError(404, 'test');
    expect(err.name).toBe('AppError');
  });

  it('sets statusCode and message from constructor', () => {
    const err = new AppError(400, 'bad request');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('bad request');
  });

  it('stores details when provided', () => {
    const err = new AppError(422, 'invalid', { field: 'email' });
    expect(err.details).toEqual({ field: 'email' });
  });

  it('leaves details undefined when omitted', () => {
    const err = new AppError(500, 'error');
    expect(err.details).toBeUndefined();
  });

  it('is instanceof Error and AppError', () => {
    const err = new AppError(500, 'err');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });
});

describe('notFound', () => {
  it('returns 404 AppError with default message', () => {
    const err = notFound();
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Registro não encontrado');
  });

  it('accepts custom message', () => {
    expect(notFound('Nada').message).toBe('Nada');
  });
});

describe('badRequest', () => {
  it('returns 400 AppError with message', () => {
    const err = badRequest('invalid');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('invalid');
  });

  it('includes details when provided', () => {
    const err = badRequest('invalid', { field: 'name' });
    expect(err.details).toEqual({ field: 'name' });
  });

  it('omits details when not provided', () => {
    expect(badRequest('invalid').details).toBeUndefined();
  });
});

describe('conflict', () => {
  it('returns 409 AppError', () => {
    const err = conflict('dupe');
    expect(err.statusCode).toBe(409);
    expect(err.message).toBe('dupe');
  });
});

describe('unauthorized', () => {
  it('returns 401 AppError with default message', () => {
    const err = unauthorized();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Não autorizado');
  });

  it('accepts custom message', () => {
    expect(unauthorized('Login required').message).toBe('Login required');
  });
});

describe('errorHandler', () => {
  let json: ReturnType<typeof vi.fn>;
  let c: Parameters<typeof errorHandler>[1];

  beforeEach(() => {
    json = vi.fn();
    c = { json, req: { method: 'GET', path: '/api/test' } } as unknown as Parameters<typeof errorHandler>[1];
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns AppError as JSON with correct status and details', async () => {
    const err = new AppError(400, 'bad', { x: 1 });
    await errorHandler(err, c);
    expect(json).toHaveBeenCalledWith({ error: 'bad', details: { x: 1 }, requestId: undefined }, 400);
  });

  it('handles ZodError with issues as 400', async () => {
    const issues = [{ path: ['email'], message: 'Required' }];
    await errorHandler({ name: 'ZodError', issues } as unknown as Parameters<typeof errorHandler>[0], c);
    expect(json).toHaveBeenCalledWith({ error: 'Dados inválidos', details: issues, requestId: undefined }, 400);
  });

  it('handles Postgres ECONNREFUSED as 503', async () => {
    await errorHandler({ code: 'ECONNREFUSED' } as unknown as Parameters<typeof errorHandler>[0], c);
    expect(json).toHaveBeenCalledWith({ error: 'Erro de conexão com banco de dados', requestId: undefined }, 503);
  });

  it('handles Postgres 57P01 as 503', async () => {
    await errorHandler({ code: '57P01' } as unknown as Parameters<typeof errorHandler>[0], c);
    expect(json).toHaveBeenCalledWith({ error: 'Erro de conexão com banco de dados', requestId: undefined }, 503);
  });

  it('handles Postgres 23505 (unique violation) as 409', async () => {
    await errorHandler({ code: '23505', message: 'unique violation' } as unknown as Parameters<typeof errorHandler>[0], c);
    expect(json).toHaveBeenCalledWith({ error: 'Registro duplicado', requestId: undefined }, 409);
  });

  it('handles unknown Postgres error as 500', async () => {
    await errorHandler({ code: '42P01', message: 'relation not found' } as unknown as Parameters<typeof errorHandler>[0], c);
    expect(json).toHaveBeenCalledWith({ error: 'Erro no banco de dados', requestId: undefined }, 500);
  });

  it('handles generic Error as 500', async () => {
    const err = new Error('something broke');
    await errorHandler(err, c);
    expect(json).toHaveBeenCalledWith({ error: 'Erro interno do servidor', requestId: undefined }, 500);
  });

});