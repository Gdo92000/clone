import { db } from '../../db';
import { printJobs, printerConfigs } from '../../db/schema';
import { eq } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import type { PrinterDriver } from './drivers';
import { NetworkPrinterDriver } from './drivers';
import { logger } from '../../lib/logger';
import crypto from 'node:crypto';

type PrinterConfig = InferSelectModel<typeof printerConfigs>;

function getPrintDriver(config: PrinterConfig): PrinterDriver {
  switch (config.printer_type) {
    case 'network':
      if (!config.ip_address) throw new Error('Network printer missing IP address');
      if (config.port === null) throw new Error('Network printer missing port');
      return new NetworkPrinterDriver(config.ip_address, config.port);
    default:
      throw new Error(`Unsupported printer type: ${config.printer_type}`);
  }
}

async function enqueuePrintJob(branchId: string, orderId: string, payload: string) {
  const jobId = crypto.randomUUID();
  await db.insert(printJobs).values({
    id: jobId,
    order_id: orderId,
    branch_id: branchId,
    status: 'pending',
    payload,
    created_at: new Date(),
    updated_at: new Date(),
  });

  processJob(jobId).catch((err: unknown) => { logger.error('Async print job failed', err, { jobId }); });
  
  return jobId;
}

async function processJob(jobId: string) {
  const jobs = await db.select().from(printJobs).where(eq(printJobs.id, jobId)).limit(1);
  if (!jobs.length) return;
  const job = jobs[0];

  const configs = await db.select().from(printerConfigs).where(eq(printerConfigs.branch_id, job.branch_id)).limit(1);
  if (!configs.length || !configs[0]?.enabled) {
    await db.update(printJobs).set({ status: 'failed', error_message: 'Printer disabled or not configured' }).where(eq(printJobs.id, jobId));
    return;
  }
  const config = configs[0];

  try {
    await db.update(printJobs).set({ status: 'sent', updated_at: new Date() }).where(eq(printJobs.id, jobId));
    
    const driver = getPrintDriver(config);
    await driver.print(job.payload);

    await db.update(printJobs).set({ status: 'completed', updated_at: new Date() }).where(eq(printJobs.id, jobId));
    logger.info('Print job completed successfully', { jobId, orderId: job.order_id });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const retryCount = job.retry_count + 1;
    const maxRetries = 3;

    if (retryCount <= maxRetries) {
      await db.update(printJobs).set({ 
        status: 'retrying', 
        retry_count: retryCount, 
        error_message: errorMessage,
        updated_at: new Date() 
      }).where(eq(printJobs.id, jobId));
      
      setTimeout(() => void processJob(jobId), Math.pow(2, retryCount) * 1000);
    } else {
      await db.update(printJobs).set({ status: 'failed', error_message: errorMessage, updated_at: new Date() }).where(eq(printJobs.id, jobId));
      logger.error('Print job failed after max retries', err instanceof Error ? err : new Error(errorMessage), { jobId, orderId: job.order_id });
    }
  }
}

export const PrintingService = {
  enqueuePrintJob,
  processJob,
};
