import { test } from '@playwright/test';
import { MOCK_USERS, AREAS, loginAs, navigateAndExpectAllowed } from './auth-helpers';

test.describe('SuperAdmin Auth Validation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, MOCK_USERS.superadmin.id);
  });

  for (const route of AREAS.superadmin.allowed) {
    test(`allows access to ${route}`, async ({ page }) => {
      await navigateAndExpectAllowed(page, route, `superadmin-allowed-${route.replace(/\//g, '_')}`);
    });
  }
});