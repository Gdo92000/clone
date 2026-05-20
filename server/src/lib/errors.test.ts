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
  let json;
  let c;

  beforeEach(() => {
    json = vi.fn();
    c = { json, req: { method: 'GET', path: '/api/test' } };
    vi.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error to prevent test logs
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns AppError as JSON with correct status and details', () => {
    const err = new AppError(400, 'bad', { x: 1 });
    errorHandler(err, c);
    expect(json).toHaveBeenCalledWith({ error: 'bad', details: { x: 1 }, requestId: undefined }, 400);
  });

  it('handles ZodError with issues as 400', () => {
    const issues = [{ path: ['email'], message: 'Required' }];
    errorHandler({ name: 'ZodError', issues } as any, c);
    expect(json).toHaveBeenCalledWith({ error: 'Dados inválidos', details: issues, requestId: undefined }, 400);
  });

  it('handles Postgres ECONNREFUSED as 503', () => {
    errorHandler({ code: 'ECONNREFUSED' } as any, c);
    expect(json).toHaveBeenCalledWith({ error: 'Erro de conexão com banco de dados', requestId: undefined }, 503);
  });

  it('handles Postgres 57P01 as 503', () => {
    errorHandler({ code: '57P01' } as any, c);
    expect(json).toHaveBeenCalledWith({ error: 'Erro de conexão com banco de dados', requestId: undefined }, 503);
  });

  it('handles Postgres 23505 (unique violation) as 409', () => {
    errorHandler({ code: '23505', message: 'unique violation' } as any, c);
    expect(json).toHaveBeenCalledWith({ error: 'Registro duplicado', requestId: undefined }, 409);
  });

  it('handles unknown Postgres error as 500', () => {
    errorHandler({ code: '42P01', message: 'relation not found' } as any, c);
    expect(json).toHaveBeenCalledWith({ error: 'Erro no banco de dados', requestId: undefined }, 500);
  });

  it('handles generic Error as 500', () => {
    const err = new Error('something broke');
    errorHandler(err, c);
    expect(json).toHaveBeenCalledWith({ error: 'Erro interno do servidor', requestId: undefined }, 500);
  });

  it('logs unhandled errors with method and path', () => {
    const err = new Error('unexpected');
    errorHandler(err, c);
    // The structured logger logs a JSON string to console.error
    const expectedMessage = expect.stringContaining('"message":"Unhandled error"');
    expect(console.error).toHaveBeenCalledWith(expectedMessage);
  });
});