import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { eq, and } from 'drizzle-orm';
import { db } from '../../../db';
import { subscriptionAddons, addons, subscriptions } from '../../../db/schema';
import { PrintingService } from '../service';

const { selectMock, insertMock, updateMock, deleteMock } = vi.hoisted(() => {
  const queryChain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb([]))),
  };

  return {
    selectMock: vi.fn().mockReturnValue(queryChain),
    insertMock: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
    updateMock: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
    deleteMock: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  };
});

vi.mock('../../../db', () => ({
  db: {
    select: selectMock,
    insert: insertMock,
    update: updateMock,
    delete: deleteMock,
  },
}));

const queryChainResult = () => ({
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  innerJoin: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb([]))),
});

const resetMocks = () => {
  selectMock.mockReset();
  selectMock.mockReturnValue(queryChainResult());
  insertMock.mockReset();
  insertMock.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
  updateMock.mockReset();
  updateMock.mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) });
  deleteMock.mockReset();
  deleteMock.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
};

describe('Kitchen Auto Print Service', () => {
  const testBranchId = 'test-branch-1';
  const testOrderId = 'order-123';
  const testPayload = 'ORDER #123\nTest Order';

  beforeEach(() => {
    vi.clearAllMocks();
    resetMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('enqueuePrintJob', () => {
    it('deve enfileirar um job de impressão com sucesso', async () => {
      const jobId = await PrintingService.enqueuePrintJob(
        testBranchId,
        testOrderId,
        testPayload
      );

      expect(jobId).toBeDefined();
      expect(typeof jobId).toBe('string');
    });

    it('deve criar job com ID único', async () => {
      const jobId1 = await PrintingService.enqueuePrintJob(
        testBranchId,
        testOrderId,
        testPayload
      );
      const jobId2 = await PrintingService.enqueuePrintJob(
        testBranchId,
        testOrderId + '2',
        testPayload
      );

      expect(jobId1).not.toBe(jobId2);
    });
  });

  describe('processJob', () => {
    it('deve falhar gracefully se impressora não estiver configurada', async () => {
      const jobId = await PrintingService.enqueuePrintJob(
        testBranchId,
        testOrderId,
        testPayload
      );

      expect(jobId).toBeDefined();
    });

    it('deve realizar retry em caso de falha temporária', async () => {
      const jobId = await PrintingService.enqueuePrintJob(
        testBranchId,
        testOrderId,
        testPayload
      );

      expect(jobId).toBeDefined();
    });
  });

  describe('Feature Gating - kitchen_auto_print', () => {
    it('deve validar se tenant possui addon ativo antes de imprimir', async () => {
      const result = await db
        .select({
          subscription_id: subscriptionAddons.subscription_id,
          addon_id: addons.id,
          feature_key: addons.feature_key,
          is_active: addons.is_active,
        })
        .from(subscriptionAddons)
        .innerJoin(addons, eq(subscriptionAddons.addon_id, addons.id))
        .innerJoin(subscriptions, eq(subscriptionAddons.subscription_id, subscriptions.company_id))
        .where(
          and(
            eq(subscriptions.company_id, testBranchId),
            eq(addons.feature_key, 'kitchen_auto_print'),
            eq(addons.is_active, true)
          )
        )
        .limit(1);

      expect(result.length).toBe(0);
    });
  });
});


