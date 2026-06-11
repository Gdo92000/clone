import { describe, it, expect } from 'vitest';
import { getStatusSteps, statusToStep } from '../trackingSteps';

describe('getStatusSteps', () => {
  it('retorna "Pedido pronto" para delivery quando status é ready', () => {
    const steps = getStatusSteps('delivery');
    const readyStep = steps.find((s) => s.status === 'ready');
    expect(readyStep?.label).toBe('Pedido pronto');
  });

  it('retorna "Pronto para retirada" para pickup quando status é ready', () => {
    const steps = getStatusSteps('pickup');
    const readyStep = steps.find((s) => s.status === 'ready');
    expect(readyStep?.label).toBe('Pronto para retirada');
  });

  it('mantém labels iguais para delivery e pickup nos status compartilhados', () => {
    const deliverySteps = getStatusSteps('delivery');
    const pickupSteps = getStatusSteps('pickup');

    const sharedStatuses = ['confirmed', 'preparing', 'delivered'];
    for (const status of sharedStatuses) {
      const d = deliverySteps.find((s) => s.status === status);
      const p = pickupSteps.find((s) => s.status === status);
      expect(d?.label).toBe(p?.label);
    }
  });

  it('inclui dispatched apenas para delivery', () => {
    const deliverySteps = getStatusSteps('delivery');
    expect(deliverySteps).toHaveLength(5);
    expect(deliverySteps.map((s) => s.status)).toEqual([
      'confirmed', 'preparing', 'ready', 'dispatched', 'delivered',
    ]);

    const pickupSteps = getStatusSteps('pickup');
    expect(pickupSteps).toHaveLength(4);
    expect(pickupSteps.map((s) => s.status)).toEqual([
      'confirmed', 'preparing', 'ready', 'delivered',
    ]);
    expect(pickupSteps.find((s) => s.status === 'dispatched')).toBeUndefined();
  });
});

describe('statusToStep', () => {
  it('retorna 0 para status undefined', () => {
    expect(statusToStep(undefined, 'delivery')).toBe(0);
  });

  it('retorna índice correto para cada status', () => {
    expect(statusToStep('confirmed', 'delivery')).toBe(0);
    expect(statusToStep('preparing', 'delivery')).toBe(1);
    expect(statusToStep('ready', 'delivery')).toBe(2);
    expect(statusToStep('dispatched', 'delivery')).toBe(3);
    expect(statusToStep('delivered', 'delivery')).toBe(4);
  });

  it('retorna mesmo índice independente de delivery_type', () => {
    expect(statusToStep('ready', 'delivery')).toBe(2);
    expect(statusToStep('ready', 'pickup')).toBe(2);
  });
});
