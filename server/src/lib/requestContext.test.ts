import { describe, it, expect } from 'vitest';
import { getRequestStore, runWithStore } from './requestContext';

describe('requestContext', () => {
  it('returns undefined outside a store context', () => {
    expect(getRequestStore()).toBeUndefined();
  });

  it('provides store inside runWithStore', async () => {
    let captured: unknown = undefined;
    await runWithStore({ requestId: 'req-123' }, () => {
      captured = getRequestStore();
      return Promise.resolve();
    });
    expect(captured).toEqual({ requestId: 'req-123' });
  });

  it('preserves userId and tenantId when set', async () => {
    let captured: unknown = undefined;
    await runWithStore({ requestId: 'req-456', userId: 'user-1', tenantId: 'tenant-1' }, () => {
      captured = getRequestStore();
      return Promise.resolve();
    });
    expect(captured).toEqual({ requestId: 'req-456', userId: 'user-1', tenantId: 'tenant-1' });
  });

  it('isolates nested stores', async () => {
    const results: string[] = [];
    await runWithStore({ requestId: 'outer' }, () => {
      const outer = getRequestStore();
      results.push(outer?.requestId ?? '');
      return runWithStore({ requestId: 'inner' }, () => {
        const inner = getRequestStore();
        results.push(inner?.requestId ?? '');
        return Promise.resolve();
      }).then(() => {
        const outerAgain = getRequestStore();
        results.push(outerAgain?.requestId ?? '');
      });
    });
    expect(results).toEqual(['outer', 'inner', 'outer']);
  });
});
