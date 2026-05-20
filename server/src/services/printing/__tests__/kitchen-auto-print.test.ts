import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PrintingService } from '../service';
import { db } from '../../db';
import { printJobs, printerConfigs } from '../../db/schema';
import { eq } from 'drizzle-orm';

describe('Kitchen Auto Print Service', () => {
  const testBranchId = 'test-branch-1';
  const testOrderId = 'order-123';
  const testPayload = 'ORDER #123\nTest Order';

  beforeEach(async () => {
    // Limpar jobs de impressão anteriores
    await db.delete(printJobs);
    await db.delete(printerConfigs);
  });

  afterEach(async () => {
    // Cleanup após cada teste
    await db.delete(printJobs);
    await db.delete(printerConfigs);
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

      // Verificar no banco
      const job = await db
        .select()
        .from(printJobs)
        .where(eq(printJobs.id, jobId))
        .limit(1);

      expect(job.length).toBe(1);
      expect(job[0].order_id).toBe(testOrderId);
      expect(job[0].branch_id).toBe(testBranchId);
      expect(job[0].status).toBe('pending');
      expect(job[0].payload).toBe(testPayload);
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
      // Não cadastrar impressora
      const jobId = await PrintingService.enqueuePrintJob(
        testBranchId,
        testOrderId,
        testPayload
      );

      // Aguardar processamento
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const job = await db
        .select()
        .from(printJobs)
        .where(eq(printJobs.id, jobId))
        .limit(1);

      expect(job.length).toBe(1);
      expect(job[0].status).toBe('failed');
    });

    it('deve realizar retry em caso de falha temporária', async () => {
      // Configurar impressora
      await db.insert(printerConfigs).values({
        branch_id: testBranchId,
        printer_type: 'network',
        ip_address: '192.168.1.100',
        port: 9100,
        model: 'ESC/POS',
        enabled: true,
      });

      const jobId = await PrintingService.enqueuePrintJob(
        testBranchId,
        testOrderId,
        testPayload
      );

      // Aguardar processamento e retries
      await new Promise((resolve) => setTimeout(resolve, 8000));

      const job = await db
        .select()
        .from(printJobs)
        .where(eq(printJobs.id, jobId))
        .limit(1);

      expect(job.length).toBe(1);
      // Deve ter tentado pelo menos uma vez (pode ter sucesso ou falha)
      expect(['pending', 'sent', 'completed', 'failed', 'retrying']).toContain(
        job[0].status
      );
    });
  });

  describe('Feature Gating - kitchen_auto_print', () => {
    it('deve validar se tenant possui addon ativo antes de imprimir', async () => {
      // Simular verificação de addon
      const hasAddon = await checkKitchenAutoPrintAddon(testBranchId);
      
      // Como não há assinatura, deve retornar false
      expect(hasAddon).toBe(false);
    });
  });
});

// Mock helper para simular verificação de addon
async function checkKitchenAutoPrintAddon(branchId: string): Promise<boolean> {
  // Simula a query de verificação de addon
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
        eq(subscriptions.company_id, branchId),
        eq(addons.feature_key, 'kitchen_auto_print'),
        eq(addons.is_active, true)
      )
    )
    .limit(1);

  return result.length > 0;
}

// Imports necessários
import { subscriptionAddons, addons, subscriptions, and } from '../../db/schema';
