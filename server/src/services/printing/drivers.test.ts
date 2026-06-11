import { describe, it, expect, vi } from 'vitest';

vi.mock('../../lib/logger', () => ({
  logger: { info: vi.fn() },
}));

describe('NetworkPrinterDriver', () => {
  it('creates driver with ip and port', async () => {
    const { NetworkPrinterDriver } = await import('./drivers');
    const driver = new NetworkPrinterDriver('192.168.1.1', 9100);

    expect(driver).toBeDefined();
  });

  it('print simulates network request', async () => {
    vi.useFakeTimers();
    const { NetworkPrinterDriver } = await import('./drivers');
    const driver = new NetworkPrinterDriver('192.168.1.1', 9100);

    const printPromise = driver.print('ESC/POS data');
    vi.advanceTimersByTime(500);

    await expect(printPromise).resolves.toBeUndefined();
    vi.useRealTimers();
  });

  it('print can fail with timeout', async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.05);

    const { NetworkPrinterDriver } = await import('./drivers');
    const driver = new NetworkPrinterDriver('192.168.1.1', 9100);

    const printPromise = driver.print('ESC/POS data');
    vi.advanceTimersByTime(500);

    await expect(printPromise).rejects.toThrow('Network timeout');
    vi.useRealTimers();
  });

  it('getStatus returns connected', async () => {
    const { NetworkPrinterDriver } = await import('./drivers');
    const driver = new NetworkPrinterDriver('192.168.1.1', 9100);

    const status = await driver.getStatus();
    expect(status).toBe('connected');
  });
});