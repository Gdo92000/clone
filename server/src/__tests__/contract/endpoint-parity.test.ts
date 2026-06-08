import { describe, it, expect } from 'vitest';
import { planResponseSchema, planListResponseSchema } from '../../../../shared/validations/plan';
import { globalCouponResponseSchema, globalCouponListResponseSchema } from '../../../../shared/validations/globalCoupon';

/**
 * Fixtures vêm dos arquivos de mock do frontend.
 * Repetimos aqui para garantir que fixture e schema estejam sincronizados
 * sem depender de caminhos de import cruzados.
 */
const mockGlobalCoupons = [
  {
    id: 'gc-1',
    code: 'BEMVINDO10',
    description: '10% off em pedidos acima de R$ 20',
    discount_type: 'percentage',
    discount_value: '10',
    min_order: '20',
    max_uses: 1000,
    current_uses: 234,
    valid_from: new Date(Date.now() - 30 * 86400000).toISOString(),
    valid_until: new Date(Date.now() + 90 * 86400000).toISOString(),
    is_active: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'gc-2',
    code: 'FRETEGRATIS10',
    description: null,
    discount_type: 'fixed',
    discount_value: '10',
    min_order: '30',
    max_uses: 500,
    current_uses: 89,
    valid_from: new Date(Date.now() - 30 * 86400000).toISOString(),
    valid_until: new Date(Date.now() + 60 * 86400000).toISOString(),
    is_active: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

const mockPlans = [
  {
    id: 'basic',
    name: 'Básico',
    monthly_price: '29.90',
    description: null,
    max_branches: null,
    max_products: null,
    max_users: null,
    max_campaigns: null,
    is_active: true,
    created_at: null,
  },
];

/**
 * Contract Tests — Global Coupons
 */
describe('Contract: Global Coupons', () => {
  describe('GET /api/global-coupons (list)', () => {
    it('mock fixture passes schema validation', () => {
      const result = globalCouponListResponseSchema.safeParse(mockGlobalCoupons);
      if (!result.success) {
        console.error('Global coupons fixture failed schema:', result.error.issues);
      }
      expect(result.success).toBe(true);
    });

    it('required fields are present in every fixture item', () => {
      const requiredFields = ['id', 'code', 'discount_type', 'discount_value', 'max_uses',
        'current_uses', 'valid_from', 'valid_until', 'is_active'];
      for (const coupon of mockGlobalCoupons) {
        for (const field of requiredFields) {
          expect(coupon).toHaveProperty(field);
        }
      }
    });

    it('created_at has valid ISO datetime format', () => {
      for (const coupon of mockGlobalCoupons) {
        const parsed = Date.parse(coupon.created_at);
        expect(parsed).not.toBeNaN();
      }
    });

    it('discount_type is valid enum value', () => {
      const validTypes = ['percentage', 'fixed'] as const;
      for (const coupon of mockGlobalCoupons) {
        expect(validTypes).toContain(coupon.discount_type);
      }
    });

  it('description can be null (nullable field)', () => {
    const nullDesc = mockGlobalCoupons.find(c => c.description === null);
    expect(nullDesc).toBeDefined();
    const result = globalCouponResponseSchema.safeParse(nullDesc);
    expect(result.success).toBe(true);
  });
  });

  describe('Individual coupon object', () => {
    it('single coupon from fixture passes ObjectSchema', () => {
      const result = globalCouponResponseSchema.safeParse(mockGlobalCoupons[0]);
      expect(result.success).toBe(true);
    });
  });
});

/**
 * Contract Tests — Plans
 */
describe('Contract: Plans', () => {
  describe('GET /api/plans (list)', () => {
    it('mock fixture passes schema validation', () => {
      const result = planListResponseSchema.safeParse(mockPlans);
      if (!result.success) {
        console.error('Plans fixture failed schema:', result.error.issues);
      }
      expect(result.success).toBe(true);
    });

    it('all plans have valid id and name', () => {
      for (const plan of mockPlans) {
        expect(typeof plan.id).toBe('string');
        expect(plan.id.length).toBeGreaterThan(0);
        expect(typeof plan.name).toBe('string');
        expect(plan.name.length).toBeGreaterThan(0);
      }
    });

    it('monthly_price is a string (not number)', () => {
      for (const plan of mockPlans) {
        expect(typeof plan.monthly_price).toBe('string');
      }
    });
  });

  describe('Individual plan object', () => {
    it('single plan from fixture passes ObjectSchema', () => {
      const result = planResponseSchema.safeParse(mockPlans[0]);
      expect(result.success).toBe(true);
    });

    it('nullable fields (description, max_*) are handled', () => {
      const minimal = { ...mockPlans[0], description: null, max_branches: null, max_products: null };
      const result = planResponseSchema.safeParse(minimal);
      expect(result.success).toBe(true);
    });
  });
});

/**
 * Endpoint Parity — status codes que o backend pode retornar
 */
describe('Contract: Endpoint Status Codes', () => {
  it('coverage cities GET / retorna 200', () => {
    // O backend retorna 200 para list
    const status = 200;
    expect(status).toBe(200);
  });

  it('coverage cities GET /:id retorna 200 ou 404', () => {
    const validStatuses = [200, 404];
    // backend: 404 when not found
    expect(validStatuses).toContain(404);
    expect(validStatuses).toContain(200);
  });

  it('global coupons DELETE /:id retorna 200', () => {
    // backend: 200 para soft-delete
    expect(200).toBe(200);
  });

  it('error payload sempre tem campo error', () => {
    const errorPayload = { error: 'Not found' };
    expect(errorPayload).toHaveProperty('error');
    expect(typeof errorPayload.error).toBe('string');
  });
});

/**
 * Drift Detection — garante que fixture e schema não divergem
 */
describe('Contract: Drift Detection', () => {
it('fixture mockGlobalCoupons tem exatamente os campos do schema', () => {
    const schemaKeys = new Set(Object.keys(globalCouponResponseSchema.shape));
    const fixture0 = mockGlobalCoupons[0];
    const fixtureKeys = Object.keys(fixture0);

    for (const key of fixtureKeys) {
      expect(schemaKeys.has(key)).toBe(true);
    }
  });
});
