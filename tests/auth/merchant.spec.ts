import { test } from '@playwright/test';
import { MOCK_USERS, AREAS, loginAs, navigateAndExpectAllowed, navigateAndExpectBlocked } from './auth-helpers';

test.describe('Merchant (Lojista) Auth Validation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, MOCK_USERS.merchant.id);
  });

  for (const route of AREAS.merchant.allowed) {
    test(`allows access to ${route}`, async ({ page }) => {
      await navigateAndExpectAllowed(page, route, `merchant-allowed-${route.replace(/\//g, '_')}`);
    });
  }

  for (const route of AREAS.merchant.blocked) {
    test(`blocks access to ${route}`, async ({ page }) => {
      await navigateAndExpectBlocked(page, route, `merchant-blocked-${route.replace(/\//g, '_')}`);
    });
  }
});