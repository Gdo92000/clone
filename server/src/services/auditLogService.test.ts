import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../db', () => ({ db: mockDb }));

import { createAuditLog } from './auditLogService';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createAuditLog', () => {
  const testParams = {
    userId: 'user-456',
    action: 'LOGIN_SUCCESS' as const,
    entityType: 'order',
    entityId: 'order-789',
    metadata: { amount: 100 },
    ipAddress: '192.168.1.1',
    userAgent: 'TestAgent/1.0',
  };

  it('inserts entry into db', async () => {
    await createAuditLog(testParams);
    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.values).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-456',
        action: 'LOGIN_SUCCESS',
        entity_type: 'order',
        entity_id: 'order-789',
        ip_address: '192.168.1.1',
        user_agent: 'TestAgent/1.0',
      }),
    );
  });

  it('inserts accepts minimal params', async () => {
    await createAuditLog({ action: 'LOGOUT' });
    expect(mockDb.values).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'LOGOUT',
        user_id: null,
        entity_type: null,
        entity_id: null,
        metadata: null,
        ip_address: null,
        user_agent: null,
      }),
    );
  });

  it('stringifies metadata to JSON', async () => {
    // Test indirectly by checking values was called
    await createAuditLog({ action: 'REGISTER', metadata: { key: 'value' } });
    expect(mockDb.values).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: JSON.stringify({ key: 'value' }),
      }),
    );
  });
});
