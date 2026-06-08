import { test, expect } from '@playwright/test';
import { MOCK_USERS, AREAS, BLOCKED_TEXT, loginAs, navigateAndExpectAllowed, navigateAndExpectBlocked } from './auth-helpers';

test.describe('Consumer Auth Validation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, MOCK_USERS.consumer.id);
  });

  for (const route of AREAS.consumer.allowed) {
    test(`allows access to ${route}`, async ({ page }) => {
      await navigateAndExpectAllowed(page, route, `consumer-allowed-${route.replace(/\//g, '_')}`);
    });
  }

  for (const route of AREAS.consumer.blocked) {
    test(`blocks access to ${route}`, async ({ page }) => {
      await navigateAndExpectBlocked(page, route, `consumer-blocked-${route.replace(/\//g, '_')}`);
    });
  }
});