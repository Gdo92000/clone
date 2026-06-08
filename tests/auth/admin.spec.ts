import { test } from '@playwright/test';
import { MOCK_USERS, AREAS, loginAs, navigateAndExpectAllowed, navigateAndExpectBlocked } from './auth-helpers';

test.describe('Admin Auth Validation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, MOCK_USERS.admin.id);
  });

  for (const route of AREAS.admin.allowed) {
    test(`allows access to ${route}`, async ({ page }) => {
      await navigateAndExpectAllowed(page, route, `admin-allowed-${route.replace(/\//g, '_')}`);
    });
  }

  for (const route of AREAS.admin.blocked) {
    test(`blocks access to ${route}`, async ({ page }) => {
      await navigateAndExpectBlocked(page, route, `admin-blocked-${route.replace(/\//g, '_')}`);
    });
  }
});