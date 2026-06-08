import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MirrorServiceError, findBranchForRestaurant, createConsumerOrderWithMirror, type CreateOrderInput } from './mirrorService';

const { selectMock, transactionMock } = vi.hoisted(() => {
  return { selectMock: vi.fn(), transactionMock: vi.fn() };
});

vi.mock('../../db', () => ({
  db: {
    select: selectMock,
    transaction: transactionMock,
  },
}));

function mockSelect(result: unknown[]) {
  const chain = {
    from: vi.fn(() => chain),
    where: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result))),
  };
  return chain;
}

function resetMocks() {
  selectMock.mockReset();
  transactionMock.mockReset();
  selectMock.mockImplementation(() => mockSelect([]));
}

const validInput: CreateOrderInput = {
  restaurant_id: 'rest-1',
  payment_method: 'pix',
  subtotal: 50,
  delivery_fee: 5,
  total: 55,
  customer_name: 'João Silva',
  customer_address: 'Rua A, 123 - Centro, Franca/SP',
  items: [
    { menu_item_id: 'item-1', name: 'Pizza Margherita', quantity: 1, price: 50 },
  ],
};

describe('MirrorServiceError', () => {
  it('carries code and message', () => {
    const err = new MirrorServiceError('Erro X', 'CODE_X');
    expect(err.message).toBe('Erro X');
    expect(err.code).toBe('CODE_X');
    expect(err.name).toBe('MirrorServiceError');
  });
});

describe('findBranchForRestaurant', () => {
  beforeEach(() => { resetMocks(); });

  it('returns branch id when direct match found', async () => {
    selectMock.mockImplementation(() => mockSelect([{ id: 'branch-1' }]));
    const result = await findBranchForRestaurant('branch-1');
    expect(result).toEqual({ id: 'branch-1' });
  });

  it('returns null when no direct match found (no fallback)', async () => {
    const result = await findBranchForRestaurant('rest-unknown');
    expect(result).toBeNull();
  });
});

describe('createConsumerOrderWithMirror', () => {
  beforeEach(() => { resetMocks(); });

  it('throws USER_NOT_FOUND when user does not exist', async () => {
    await expect(createConsumerOrderWithMirror('user-missing', validInput))
      .rejects.toThrow(MirrorServiceError);
    await expect(createConsumerOrderWithMirror('user-missing', validInput))
      .rejects.toMatchObject({ code: 'USER_NOT_FOUND' });
  });

  it('throws INVALID_MENU_ITEM when menu_item_id does not exist', async () => {
    selectMock
      .mockImplementationOnce(() => mockSelect([{ id: 'user-1', name: 'João', phone: null }]))
      .mockImplementationOnce(() => mockSelect([]));
    await expect(createConsumerOrderWithMirror('user-1', validInput))
      .rejects.toMatchObject({ code: 'INVALID_MENU_ITEM' });
  });

  it('throws BRANCH_NOT_FOUND when no branch matches (no fallback)', async () => {
    selectMock
      .mockImplementationOnce(() => mockSelect([{ id: 'user-1', name: 'João', phone: null }]))
      .mockImplementationOnce(() => mockSelect([{ id: 'item-1' }]))
      .mockImplementationOnce(() => mockSelect([]));
    await expect(createConsumerOrderWithMirror('user-1', validInput))
      .rejects.toMatchObject({ code: 'BRANCH_NOT_FOUND' });
  });

  it('calls db.transaction when all validations pass', async () => {
    selectMock
      .mockImplementationOnce(() => mockSelect([{ id: 'user-1', name: 'João', phone: null }]))
      .mockImplementationOnce(() => mockSelect([{ id: 'item-1' }]))
      .mockImplementationOnce(() => mockSelect([{ id: 'branch-1' }]));
    transactionMock.mockResolvedValue({ order: { id: 'order-1' }, items: [], mirror: {}, mirrorItems: [] });
    const result = await createConsumerOrderWithMirror('user-1', validInput);
    expect(transactionMock).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('accepts optional idempotencyKey parameter', async () => {
    selectMock
      .mockImplementationOnce(() => mockSelect([{ id: 'user-1', name: 'João', phone: null }]))
      .mockImplementationOnce(() => mockSelect([{ id: 'item-1' }]))
      .mockImplementationOnce(() => mockSelect([{ id: 'branch-1' }]));
    transactionMock.mockResolvedValue({ order: { id: 'order-1' }, items: [], mirror: {}, mirrorItems: [] });
    const result = await createConsumerOrderWithMirror('user-1', validInput, 'idem-123');
    expect(transactionMock).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
