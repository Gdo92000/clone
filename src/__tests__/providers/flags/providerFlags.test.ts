import { describe, it, expect } from 'vitest';
import { isMockRestaurants, isMockOrders } from '@/providers/flags';

describe('Provider Flags', () => {
	it('restaurants e orders defaults to false em testes', () => {
		expect(isMockRestaurants()).toBe(false);
		expect(isMockOrders()).toBe(false);
	});
});
