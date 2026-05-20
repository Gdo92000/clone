import { db } from '../../db';
import { printJobs, printerConfigs } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { NetworkPrinterDriver, PrinterDriver } from './drivers';
import { logger } from '../../lib/logger';
import crypto from 'node:crypto';

export class PrintingService {
  private static async getDriver(config: any): Promise<PrinterDriver> {
    switch (config.printer_type) {
      case 'network':
        return new NetworkPrinterDriver(config.ip_address, config.port);
      default:
        throw new Error(`Unsupported printer type: ${config.printer_type}`);
    }
  }

  static async enqueuePrintJob(branchId: string, orderId: string, payload: string) {
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

    // Trigger async processing (non-blocking)
    this.processJob(jobId).catch(err => logger.error('Async print job failed', err, { jobId }));
    
    return jobId;
  }

  static async processJob(jobId: string) {
    const [job] = await db.select().from(printJobs).where(eq(printJobs.id, jobId)).limit(1);
    if (!job) return;

    const [config] = await db.select().from(printerConfigs).where(eq(printerConfigs.branch_id, job.branch_id)).limit(1);
    if (!config || !config.enabled) {
      await db.update(printJobs).set({ status: 'failed', error_message: 'Printer disabled or not configured' }).where(eq(printJobs.id, jobId));
      return;
    }

    try {
      await db.update(printJobs).set({ status: 'sent', updated_at: new Date() }).where(eq(printJobs.id, jobId));
      
      const driver = await this.getDriver(config);
      await driver.print(job.payload);

      await db.update(printJobs).set({ status: 'completed', updated_at: new Date() }).where(eq(printJobs.id, jobId));
      logger.info('Print job completed successfully', { jobId, orderId: job.order_id });
    } catch (err: any) {
      const retryCount = job.retry_count + 1;
      const maxRetries = 3;

      if (retryCount <= maxRetries) {
        await db.update(printJobs).set({ 
          status: 'retrying', 
          retry_count: retryCount, 
          error_message: err.message,
          updated_at: new Date() 
        }).where(eq(printJobs.id, jobId));
        
        // Exponential backoff retry
        setTimeout(() => this.processJob(jobId), Math.pow(2, retryCount) * 1000);
      } else {
        await db.update(printJobs).set({ status: 'failed', error_message: err.message, updated_at: new Date() }).where(eq(printJobs.id, jobId));
        logger.error('Print job failed after max retries', err, { jobId, orderId: job.order_id });
      }
    }
  }
}
